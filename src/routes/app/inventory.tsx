/* ============================================================================
   PAGE 5 — INPUTS & INVENTORY MANAGEMENT  (/app/inventory)

   Blueprint sections implemented:
   5.1 Input catalog (searchable, filterable, paginated)   -> CatalogView
   5.2 My inventory (stock dashboard)                      -> StockView
   5.3 AI-generated purchase list                          -> PurchaseView
   5.4 Input application log (per crop)                    -> ApplicationView
   5.5 Supplier directory                                  -> SupplierView
   5.6 Input cost analytics                                -> AnalyticsView

   Every control is wired: 23 dialogs/wizards, 6 drawers, real downloads,
   tel:/sms:/maps links, route links to /app/crops, /app/planner and
   /app/dashboard, and an M-Pesa style payment simulation that restocks the
   store when it settles.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BellRing,
  Bot,
  Boxes,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Coins,
  Download,
  Eye,
  Filter,
  FlaskConical,
  Gauge,
  HandCoins,
  ListFilter,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  Pencil,
  Phone,
  PiggyBank,
  Plus,
  Printer,
  RefreshCw,
  Repeat,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Warehouse,
  Wheat,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
  WizardActions,
} from "../../components/app/DashboardWidgets";
import {
  BarChart,
  CatalogCard,
  DonutChart,
  InventoryHeaderCard,
  Sparkline,
  StockMeter,
  TrendChart,
} from "../../components/app/InventoryWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  Dialog,
  OtpInput,
  PinPad,
  Stepper,
  Toggle,
} from "../../components/auth/controls";
import { Pagination, Reveal, Stars } from "../../components/ui/primitives";
import {
  AI_REASONS,
  ALERT_DEFAULTS,
  type AlertSettings,
  APPLICATION_LOG,
  APPLICATION_METHODS,
  APPLICATION_WEATHER,
  type ApplicationRow,
  bestOffer,
  CATALOG_CATEGORIES,
  CATEGORY_LABEL,
  CATEGORY_SHORT,
  CATEGORY_SWAHILI,
  type CatalogItem,
  COST_BY_CATEGORY,
  FARM_CONTEXT,
  INPUT_CATALOG,
  type InputCategory,
  MOVEMENT_LABEL,
  type MovementKind,
  offersFor,
  PRICE_TREND_SERIES,
  PRICE_TRENDS,
  type PriceTrendKey,
  PURCHASE_SUGGESTIONS,
  type PurchaseSuggestion,
  SAVINGS,
  SCHEDULED_APPLICATIONS,
  SEASON_COSTS,
  STOCK_MOVEMENTS,
  STOCK_ROWS,
  STOCK_STATUS_LABEL,
  STORES,
  type StockMovement,
  type StockRow,
  type StockStatus,
  type StoreLocation,
  SUPPLIERS,
  type Supplier,
  stockStatus,
} from "../../data/app/inventory";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/inventory")({
  component: InputsInventoryPage,
});

type View =
  | "catalog"
  | "stock"
  | "purchase"
  | "application"
  | "suppliers"
  | "analytics";

type DrawerId =
  | "item"
  | "stock"
  | "supplier"
  | "record"
  | "price-history"
  | "orders"
  | null;

type ModalId =
  | "compare"
  | "add-to-list"
  | "order"
  | "adjust"
  | "apply"
  | "transfer"
  | "stocktake"
  | "new-item"
  | "delete-record"
  | "edit-record"
  | "duplicate-record"
  | "rate-supplier"
  | "alert-settings"
  | "sync"
  | "export"
  | "ai-regen"
  | "swap"
  | "stores"
  | "price-alert"
  | "delete-line"
  | "batch"
  | "add-supplier"
  | "method"
  | null;

interface OrderLine {
  itemId: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  supplierId: string;
}

interface OrderRecord {
  id: string;
  at: string;
  supplier: string;
  fulfilment: string;
  phone: string;
  receipt: string;
  lines: OrderLine[];
  total: number;
}

interface PriceAlert {
  id: string;
  label: string;
  target: number;
  direction: "below" | "above";
  phone: string;
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  const id = useId();
  return (
    <div className={`gm-field ${full ? "full" : ""} mb-2`}>
      <label className="gm-f-label" htmlFor={id}>
        {label}
      </label>
      <div id={id}>{children}</div>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
      {children}
    </div>
  );
}

function downloadText(filename: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function receiptCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function statusTone(status: StockStatus): "low" | "medium" | "high" {
  return status === "ok" ? "low" : status === "low" ? "medium" : "high";
}

function priorityTone(priority: PurchaseSuggestion["priority"]) {
  return priority === "urgent"
    ? "high"
    : priority === "soon"
      ? "medium"
      : "low";
}

function telHref(phone: string) {
  return `tel:+254${phone.replace(/\D/g, "").slice(1)}`;
}

function smsHref(phone: string, body: string) {
  return `sms:+254${phone.replace(/\D/g, "").slice(1)}?&body=${encodeURIComponent(body)}`;
}

function mapsHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function money(n: number) {
  return kes(Math.round(n));
}

function InputsInventoryPage() {
  const toast = useToast();

  /* ---------------- navigation + overlays ---------------- */
  const [view, setView] = useState<View>("catalog");
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);

  /* ---------------- selections ---------------- */
  const [selectedItemId, setSelectedItemId] = useState("cat-dap");
  const [selectedStockId, setSelectedStockId] = useState("stk-02");
  const [selectedSupplierId, setSelectedSupplierId] =
    useState("sup-githunguri");
  const [selectedRecordId, setSelectedRecordId] = useState("app-14");
  const [selectedLineId, setSelectedLineId] = useState("buy-01");
  const [compareItemId, setCompareItemId] = useState("cat-mancozeb");

  /* ---------------- catalog state (5.1) ---------------- */
  const [catalogCategory, setCatalogCategory] =
    useState<InputCategoryFilter>("all");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogCrop, setCatalogCrop] = useState("All crops");
  const [catalogSort, setCatalogSort] = useState("name");
  const [catalogPage, setCatalogPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);

  /* ---------------- inventory state (5.2) ---------------- */
  const [stock, setStock] = useState<StockRow[]>(STOCK_ROWS);
  const [movements, setMovements] = useState<StockMovement[]>(STOCK_MOVEMENTS);
  const [stores, setStores] = useState<StoreLocation[]>(STORES);
  const [stockFilter, setStockFilter] = useState<StockStatus | "all">("all");
  const [stockQuery, setStockQuery] = useState("");
  const [stockPage, setStockPage] = useState(1);

  /* ---------------- purchase list state (5.3) ---------------- */
  const [purchases, setPurchases] =
    useState<PurchaseSuggestion[]>(PURCHASE_SUGGESTIONS);
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([
    "buy-01",
    "buy-02",
    "buy-03",
  ]);
  const [horizon, setHorizon] = useState(14);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);

  /* ---------------- application log state (5.4) ---------------- */
  const [applications, setApplications] =
    useState<ApplicationRow[]>(APPLICATION_LOG);
  const [appCrop, setAppCrop] = useState("All crops");
  const [appQuery, setAppQuery] = useState("");
  const [appMethod, setAppMethod] = useState("All methods");
  const [appPage, setAppPage] = useState(1);

  /* ---------------- supplier state (5.5) ---------------- */
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [supplierType, setSupplierType] = useState("All suppliers");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierSort, setSupplierSort] = useState("distance");
  const [supplierLayout, setSupplierLayout] = useState<"cards" | "table">(
    "cards",
  );

  /* ---------------- analytics state (5.6) ---------------- */
  const [trendKey, setTrendKey] = useState<PriceTrendKey>("dap");
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: "alert-can",
      label: "CAN 50 kg",
      target: 4900,
      direction: "below",
      phone: FARM_CONTEXT.phone,
    },
  ]);
  const [alerts, setAlerts] = useState<AlertSettings>(ALERT_DEFAULTS);

  /* close the shell's own overlays whenever this page opens one */
  useEffect(() => {
    if (modal || drawer)
      window.dispatchEvent(new Event("close-appshell-drawers"));
  }, [modal, drawer]);

  /* clicking anywhere closes an open row menu */
  useEffect(() => {
    if (!rowMenu) return;
    const close = () => setRowMenu(null);
    window.setTimeout(() => window.addEventListener("click", close), 0);
    return () => window.removeEventListener("click", close);
  }, [rowMenu]);

  /* ---------------- lookups ---------------- */
  const itemById = (id: string) =>
    INPUT_CATALOG.find((item) => item.id === id) ?? null;
  const supplierById = (id: string) =>
    suppliers.find((supplier) => supplier.id === id) ?? suppliers[0];
  const storeById = (id: string) =>
    stores.find((store) => store.id === id) ?? stores[0];

  const selectedItem = itemById(selectedItemId) ?? INPUT_CATALOG[0];
  const compareItem = itemById(compareItemId) ?? INPUT_CATALOG[0];
  const selectedStock =
    stock.find((row) => row.id === selectedStockId) ?? stock[0];
  const selectedSupplier = supplierById(selectedSupplierId);
  const selectedRecord =
    applications.find((row) => row.id === selectedRecordId) ?? applications[0];
  const selectedLine =
    purchases.find((row) => row.id === selectedLineId) ?? purchases[0];
  const stockMovements = movements.filter(
    (movement) => movement.stockId === selectedStock?.id,
  );

  /* ---------------- derived numbers ---------------- */
  const stockValue = stock.reduce(
    (sum, row) => sum + row.onHand * row.unitCost,
    0,
  );
  const lowOrOut = stock.filter((row) => stockStatus(row) !== "ok");
  const visiblePurchases = purchases.filter((line) => line.daysOut <= horizon);
  const selectedLines = purchases.filter((line) =>
    selectedLineIds.includes(line.id),
  );
  const seasonSpend = SEASON_COSTS.reduce(
    (sum, season) =>
      season.id === "season-2026s"
        ? season.fertilizer + season.protection + season.seeds + season.manure
        : sum,
    0,
  );
  const applicationSpend = applications.reduce((sum, row) => sum + row.cost, 0);

  const kpis = [
    {
      label: "Stock lines tracked",
      value: `${stock.length}`,
      note: `${stores.length} storage locations`,
    },
    {
      label: "Stock value",
      value: money(stockValue),
      note: "At last purchase price",
    },
    {
      label: "Action needed",
      value: `${lowOrOut.length}`,
      note: `${stock.filter((r) => stockStatus(r) === "out").length} out · ${stock.filter((r) => stockStatus(r) === "low").length} low`,
    },
    {
      label: "Season input spend",
      value: money(seasonSpend),
      note: `${money(applicationSpend)} logged to crops`,
    },
  ];

  /* ---------------- shared actions ---------------- */
  const openItem = (id: string) => {
    setSelectedItemId(id);
    setDrawer("item");
  };

  const openStock = (id: string) => {
    setSelectedStockId(id);
    setDrawer("stock");
  };

  const openSupplier = (id: string) => {
    setSelectedSupplierId(id);
    setDrawer("supplier");
  };

  const openRecord = (id: string) => {
    setSelectedRecordId(id);
    setDrawer("record");
  };

  const openCompare = (id: string) => {
    setCompareItemId(id);
    setModal("compare");
  };

  const addLine = (line: PurchaseSuggestion) => {
    setPurchases((rows) => [line, ...rows]);
    setSelectedLineIds((ids) => [...ids, line.id]);
    setModal(null);
    setDrawer(null);
    setView("purchase");
    toast.notify(`${line.name} added to the purchase list`, "success");
  };

  const orderLinesFor = (lines: OrderLine[]) => {
    setOrderLines(lines);
    setModal("order");
  };

  const completeOrder = (order: OrderRecord) => {
    setOrders((rows) => [order, ...rows]);
    setStock((rows) => {
      const next = [...rows];
      for (const line of order.lines) {
        const index = next.findIndex((row) => row.itemId === line.itemId);
        if (index >= 0) {
          const row = next[index];
          next[index] = {
            ...row,
            onHand: Math.round((row.onHand + line.qty) * 100) / 100,
            lastUpdated: FARM_CONTEXT.today,
          };
        } else {
          next.unshift({
            id: `stk-${order.id}`,
            itemId: line.itemId,
            name: line.name,
            category: itemById(line.itemId)?.category ?? "equipment",
            onHand: line.qty,
            unit: line.unit,
            reorder: Math.max(1, Math.round(line.qty / 2)),
            allocatedTo: "Unallocated",
            storeId: "store-main",
            batch: `RCV-${order.receipt.slice(0, 5)}`,
            expiry: null,
            unitCost: line.unitPrice,
            lastUpdated: FARM_CONTEXT.today,
          });
        }
      }
      return next;
    });
    setMovements((rows) => [
      ...order.lines.map((line, index) => ({
        id: `${order.id}-${index}`,
        stockId:
          stock.find((row) => row.itemId === line.itemId)?.id ??
          `stk-${order.id}`,
        kind: "in" as MovementKind,
        at: FARM_CONTEXT.today,
        qty: `+${line.qty} ${line.unit}`,
        by: order.supplier,
        note: `M-Pesa order ${order.receipt} · ${order.fulfilment}`,
      })),
      ...rows,
    ]);
    setPurchases((rows) =>
      rows.filter(
        (row) => !order.lines.some((line) => line.itemId === row.itemId),
      ),
    );
    setSelectedLineIds((ids) =>
      ids.filter(
        (id) =>
          !purchases.some(
            (row) =>
              row.id === id &&
              order.lines.some((line) => line.itemId === row.itemId),
          ),
      ),
    );
    setDrawer(null);
    toast.notify(
      `M-Pesa confirmed · ${money(order.total)} to ${order.supplier}`,
      "success",
    );
  };

  const applyStockDelta = (
    stockId: string,
    delta: number,
    kind: MovementKind,
    note: string,
  ) => {
    setStock((rows) =>
      rows.map((row) =>
        row.id === stockId
          ? {
              ...row,
              onHand: Math.max(0, Math.round((row.onHand + delta) * 100) / 100),
              lastUpdated: FARM_CONTEXT.today,
            }
          : row,
      ),
    );
    setMovements((rows) => [
      {
        id: `mov-${rows.length + 1}-${stockId}`,
        stockId,
        kind,
        at: FARM_CONTEXT.today,
        qty: `${delta > 0 ? "+" : "−"}${Math.abs(delta)}`,
        by: FARM_CONTEXT.farmer,
        note,
      },
      ...rows,
    ]);
  };

  const exportFile = (scope: string, format: "csv" | "txt") => {
    const header =
      format === "csv"
        ? "Item,Category,On hand,Unit,Reorder,Status,Allocated to,Storage,Value (KES)\n"
        : "GROWMO STOCK SHEET\nMary Wanjiku · Githunguri, Kiambu\n\n";
    const body = stock
      .map((row) => {
        const store = storeById(row.storeId);
        const value = Math.round(row.onHand * row.unitCost);
        return format === "csv"
          ? [
              row.name,
              CATEGORY_LABEL[row.category],
              row.onHand,
              row.unit,
              row.reorder,
              STOCK_STATUS_LABEL[stockStatus(row)],
              row.allocatedTo,
              store.name,
              value,
            ].join(",")
          : `${row.name} — ${row.onHand} ${row.unit} (${STOCK_STATUS_LABEL[stockStatus(row)]}) · ${store.name} · ${money(value)}`;
      })
      .join(format === "csv" ? "\n" : "\n");
    downloadText(
      `growmo-inventory-${scope}.${format}`,
      `${header}${body}\n`,
      format === "csv" ? "text/csv" : "text/plain",
    );
    toast.notify(`Stock sheet (${scope}) downloaded`, "success");
  };

  return (
    <div>
      <Reveal>
        <InventoryHeaderCard
          kpis={kpis}
          actions={
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  const urgent = visiblePurchases
                    .filter((line) => line.priority !== "planned")
                    .slice(0, 3);
                  const lines: OrderLine[] = urgent.map((line) => ({
                    itemId: line.itemId,
                    name: line.name,
                    qty: line.qty,
                    unit: line.unit,
                    unitPrice: Math.round(line.estCost / line.qty),
                    supplierId: line.supplierId,
                  }));
                  if (!lines.length) {
                    setView("catalog");
                    toast.notify("Pick inputs from the catalog first", "info");
                    return;
                  }
                  setSelectedLineIds(urgent.map((line) => line.id));
                  orderLinesFor(lines);
                }}
              >
                <ShoppingBag /> Order urgent inputs
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setModal("apply")}
              >
                <ClipboardList /> Record application
              </button>
              <Link className="gm-btn gm-btn-ghost" to="/app/crops">
                <Sprout /> Open crop tracker
              </Link>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="Inventory actions"
                  aria-expanded={menu}
                  onClick={() => setMenu((open) => !open)}
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="gm-menu">
                    <p className="gm-menuhead">Inventory actions</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("stocktake");
                      }}
                    >
                      <PackageCheck /> Run a stocktake
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("new-item");
                      }}
                    >
                      <Plus /> Add a stock line
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("sync");
                      }}
                    >
                      <RefreshCw /> Check supplier stock
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("stores");
                      }}
                    >
                      <Warehouse /> Manage storage locations
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setDrawer("orders");
                      }}
                    >
                      <HandCoins /> M-Pesa order receipts ({orders.length})
                    </button>
                    <hr />
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("alert-settings");
                      }}
                    >
                      <BellRing /> Low-stock alert settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("export");
                      }}
                    >
                      <Download /> Export inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        window.print();
                      }}
                    >
                      <Printer /> Print stock sheet
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />
      </Reveal>

      {menu ? (
        <button
          type="button"
          className="gm-drop-close"
          aria-label="Close inventory actions"
          onClick={() => setMenu(false)}
        />
      ) : null}

      <PlannerSubtabs
        value={view}
        label="Inputs and inventory workspace"
        onChange={setView}
        items={[
          {
            id: "catalog",
            label: "Input catalog",
            icon: <Store />,
            count: INPUT_CATALOG.length,
          },
          {
            id: "stock",
            label: "My inventory",
            icon: <Boxes />,
            count: stock.length,
          },
          {
            id: "purchase",
            label: "AI purchase list",
            icon: <Bot />,
            count: visiblePurchases.length,
          },
          {
            id: "application",
            label: "Application log",
            icon: <FlaskConical />,
            count: applications.length,
          },
          {
            id: "suppliers",
            label: "Suppliers",
            icon: <Truck />,
            count: suppliers.length,
          },
          {
            id: "analytics",
            label: "Cost analytics",
            icon: <TrendingUp />,
            count: SAVINGS.length,
          },
        ]}
      />

      {view === "catalog" ? (
        <CatalogView
          category={catalogCategory}
          query={catalogQuery}
          crop={catalogCrop}
          sort={catalogSort}
          page={catalogPage}
          inStockOnly={inStockOnly}
          onCategory={(value) => {
            setCatalogCategory(value);
            setCatalogPage(1);
          }}
          onQuery={(value) => {
            setCatalogQuery(value);
            setCatalogPage(1);
          }}
          onCrop={(value) => {
            setCatalogCrop(value);
            setCatalogPage(1);
          }}
          onSort={setCatalogSort}
          onPage={setCatalogPage}
          onInStockOnly={(value) => {
            setInStockOnly(value);
            setCatalogPage(1);
          }}
          onDetails={openItem}
          onCompare={openCompare}
          onAdd={(id) => {
            setSelectedLineId(id);
            setModal("add-to-list");
          }}
          onPriceHistory={(id) => {
            setSelectedItemId(id);
            setDrawer("price-history");
          }}
        />
      ) : null}

      {view === "stock" ? (
        <StockView
          stock={stock}
          movements={movements}
          filter={stockFilter}
          query={stockQuery}
          page={stockPage}
          stockValue={stockValue}
          onFilter={(value) => {
            setStockFilter(value);
            setStockPage(1);
          }}
          onQuery={(value) => {
            setStockQuery(value);
            setStockPage(1);
          }}
          onPage={setStockPage}
          onOpen={openStock}
          onAdjust={(id) => {
            setSelectedStockId(id);
            setModal("adjust");
          }}
          onUsage={(id) => {
            const row = stock.find((item) => item.id === id);
            if (row) setSelectedItemId(row.itemId);
            setModal("apply");
          }}
          onTransfer={(id) => {
            setSelectedStockId(id);
            setModal("transfer");
          }}
          onOrder={(id) => {
            const row = stock.find((item) => item.id === id);
            if (!row) return;
            const offer = bestOffer(row.itemId);
            orderLinesFor([
              {
                itemId: row.itemId,
                name: row.name,
                qty: Math.max(1, Math.ceil(row.reorder)),
                unit: row.unit,
                unitPrice: offer?.offer.price ?? row.unitCost,
                supplierId: offer?.supplier.id ?? "sup-githunguri",
              },
            ]);
          }}
          onBatch={(id) => {
            setSelectedStockId(id);
            setModal("batch");
          }}
          onStocktake={() => setModal("stocktake")}
          onNewItem={() => setModal("new-item")}
          onRowMenu={setRowMenu}
          rowMenu={rowMenu}
        />
      ) : null}

      {view === "purchase" ? (
        <PurchaseView
          lines={visiblePurchases}
          allLines={purchases}
          selectedIds={selectedLineIds}
          horizon={horizon}
          orders={orders}
          savingsTotal={SAVINGS.reduce((sum, row) => sum + row.saving, 0)}
          onHorizon={setHorizon}
          onToggle={(id) =>
            setSelectedLineIds((ids) =>
              ids.includes(id) ? ids.filter((row) => row !== id) : [...ids, id],
            )
          }
          onOrderLine={(line) =>
            orderLinesFor([
              {
                itemId: line.itemId,
                name: line.name,
                qty: line.qty,
                unit: line.unit,
                unitPrice: Math.round(line.estCost / line.qty),
                supplierId: line.supplierId,
              },
            ])
          }
          onOrderSelected={() =>
            orderLinesFor(
              selectedLines.map((line) => ({
                itemId: line.itemId,
                name: line.name,
                qty: line.qty,
                unit: line.unit,
                unitPrice: Math.round(line.estCost / line.qty),
                supplierId: line.supplierId,
              })),
            )
          }
          onSwap={(id) => {
            setSelectedLineId(id);
            setModal("swap");
          }}
          onEdit={(id) => {
            setSelectedLineId(id);
            setModal("add-to-list");
          }}
          onDelete={(id) => {
            setSelectedLineId(id);
            setModal("delete-line");
          }}
          onRegenerate={() => setModal("ai-regen")}
          onMethod={() => setModal("method")}
          onSupplier={openSupplier}
          onItem={openItem}
          onRaiseManure={() => {
            setPurchases((rows) =>
              rows.map((row) =>
                row.id === "buy-04"
                  ? {
                      ...row,
                      qty: 4,
                      estCost: 22000,
                      bulkSaving: 4000,
                      reason:
                        "Full tipper load — rate drops to KES 5,500/tonne",
                    }
                  : row,
              ),
            );
            toast.notify(
              "Manure order raised to a full 4-tonne tipper",
              "success",
            );
          }}
          onBulkCan={() => {
            setPurchases((rows) => [
              {
                id: `buy-can-${orders.length + 1}`,
                itemId: "cat-can-bulk",
                name: "CAN 26:0:0 pallet (10 × 50 kg)",
                category: "fertilizer",
                qty: 1,
                unit: "pallet",
                needBy: "27 Nov 2026",
                daysOut: 14,
                estCost: 50000,
                supplierId: "sup-yara",
                reason:
                  "Bulk pallet from the Nairobi distributor saves KES 500/bag",
                priority: "planned",
                bulkSaving: 5000,
                bulkNote: "Pallet price · free Wednesday delivery",
              },
              ...rows,
            ]);
            toast.notify(
              "CAN pallet added — KES 5,000 cheaper per bag",
              "success",
            );
          }}
          onNozzles={() => {
            const line = purchases.find((row) => row.id === "buy-08");
            if (!line) return;
            orderLinesFor([
              {
                itemId: line.itemId,
                name: line.name,
                qty: 1,
                unit: line.unit,
                unitPrice: line.estCost,
                supplierId: line.supplierId,
              },
            ]);
          }}
          onCompost={() => {
            setPurchases((rows) => [
              {
                id: `buy-compost-${rows.length + 1}`,
                itemId: "cat-compost",
                name: "On-farm compost (tonne)",
                category: "fertilizer",
                qty: 1,
                unit: "tonne",
                needBy: "05 Dec 2026",
                daysOut: 22,
                estCost: 0,
                supplierId: "sup-mary-dairy",
                reason:
                  "Turn the existing heap twice — 0.6 t of compost for the potato beds at no cost",
                priority: "planned",
                bulkSaving: 3900,
                bulkNote: "Labour only · no purchase needed",
              },
              ...rows,
            ]);
            toast.notify("Compost plan added — KES 3,900 saved", "success");
          }}
        />
      ) : null}

      {view === "application" ? (
        <ApplicationView
          rows={applications}
          crop={appCrop}
          query={appQuery}
          method={appMethod}
          page={appPage}
          onCrop={(value) => {
            setAppCrop(value);
            setAppPage(1);
          }}
          onQuery={(value) => {
            setAppQuery(value);
            setAppPage(1);
          }}
          onMethod={(value) => {
            setAppMethod(value);
            setAppPage(1);
          }}
          onPage={setAppPage}
          onOpen={openRecord}
          onAdd={() => setModal("apply")}
          onEdit={(id) => {
            setSelectedRecordId(id);
            setModal("edit-record");
          }}
          onDuplicate={(id) => {
            setSelectedRecordId(id);
            setModal("duplicate-record");
          }}
          onDelete={(id) => {
            setSelectedRecordId(id);
            setModal("delete-record");
          }}
          onLogScheduled={() => setModal("apply")}
        />
      ) : null}

      {view === "suppliers" ? (
        <SupplierView
          suppliers={suppliers}
          type={supplierType}
          query={supplierQuery}
          sort={supplierSort}
          layout={supplierLayout}
          onType={(value) => setSupplierType(value)}
          onQuery={setSupplierQuery}
          onSort={setSupplierSort}
          onLayout={setSupplierLayout}
          onOpen={openSupplier}
          onRate={(id) => {
            setSelectedSupplierId(id);
            setModal("rate-supplier");
          }}
          onOrder={(id) => {
            const supplier = supplierById(id);
            const first = supplier.offers[0];
            if (!first) return;
            orderLinesFor([
              {
                itemId: first.itemId,
                name: first.item,
                qty: 1,
                unit: first.pack,
                unitPrice: first.price,
                supplierId: supplier.id,
              },
            ]);
          }}
          onAdd={() => setModal("add-supplier")}
        />
      ) : null}

      {view === "analytics" ? (
        <AnalyticsView
          seasonSpend={seasonSpend}
          applicationSpend={applicationSpend}
          trendKey={trendKey}
          alerts={alerts}
          priceAlerts={priceAlerts}
          stockValue={stockValue}
          onTrend={setTrendKey}
          onPriceAlert={() => setModal("price-alert")}
          onAlertSettings={() => setModal("alert-settings")}
          onExport={() => setModal("export")}
          onBulkCan={() => {
            setView("purchase");
            setModal("swap");
            setSelectedLineId("buy-01");
          }}
          onRaiseManure={() => {
            setPurchases((rows) =>
              rows.map((row) =>
                row.id === "buy-04" ? { ...row, qty: 4, estCost: 22000 } : row,
              ),
            );
            toast.notify("Manure order raised to a full tipper", "success");
          }}
          onSwap={(id) => {
            setSelectedLineId(id);
            setView("purchase");
            setModal("swap");
          }}
          onCompost={() => {
            setPurchases((rows) => [
              {
                id: `buy-compost-${rows.length + 1}`,
                itemId: "cat-compost",
                name: "On-farm compost (tonne)",
                category: "fertilizer",
                qty: 1,
                unit: "tonne",
                needBy: "05 Dec 2026",
                daysOut: 22,
                estCost: 0,
                supplierId: "sup-mary-dairy",
                reason:
                  "Turn the existing heap twice — 0.6 t of compost for the potato beds at no cost",
                priority: "planned",
                bulkSaving: 3900,
                bulkNote: "Labour only · no purchase needed",
              },
              ...rows,
            ]);
            toast.notify("Compost plan added — KES 3,900 saved", "success");
          }}
          onOrderNozzles={() => {
            const line = purchases.find((row) => row.id === "buy-08");
            if (!line) return;
            orderLinesFor([
              {
                itemId: line.itemId,
                name: line.name,
                qty: 1,
                unit: line.unit,
                unitPrice: line.estCost,
                supplierId: line.supplierId,
              },
            ]);
          }}
        />
      ) : null}

      {/* ---------------- drawers ---------------- */}
      <DashboardDrawer
        open={drawer === "item"}
        title={selectedItem?.name ?? "Input"}
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                openCompare(selectedItem.id);
              }}
            >
              <ListFilter /> Compare prices
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setDrawer(null);
                setSelectedLineId(selectedItem.id);
                setModal("add-to-list");
              }}
            >
              <ShoppingBasket /> Add to purchase list
            </button>
          </div>
        }
      >
        {selectedItem ? <ItemDetail item={selectedItem} /> : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "stock"}
        title={selectedStock?.name ?? "Stock line"}
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setModal("adjust")}
            >
              <Pencil /> Adjust stock
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => setModal("apply")}
            >
              <FlaskConical /> Record usage
            </button>
          </div>
        }
      >
        {selectedStock ? (
          <StockDetail
            row={selectedStock}
            store={storeById(selectedStock.storeId)}
            movements={stockMovements}
            onTransfer={() => setModal("transfer")}
            onBatch={() => setModal("batch")}
            onOrder={() => {
              const offer = bestOffer(selectedStock.itemId);
              setDrawer(null);
              orderLinesFor([
                {
                  itemId: selectedStock.itemId,
                  name: selectedStock.name,
                  qty: Math.max(1, Math.ceil(selectedStock.reorder)),
                  unit: selectedStock.unit,
                  unitPrice: offer?.offer.price ?? selectedStock.unitCost,
                  supplierId: offer?.supplier.id ?? "sup-githunguri",
                },
              ]);
            }}
          />
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "supplier"}
        title={selectedSupplier?.name ?? "Supplier"}
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex flex-wrap gap-2">
            <a
              className="gm-btn gm-btn-outline"
              href={telHref(selectedSupplier?.phone ?? "0722115480")}
            >
              <Phone /> Call
            </a>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => setModal("rate-supplier")}
            >
              <Sparkles /> Rate supplier
            </button>
          </div>
        }
      >
        {selectedSupplier ? (
          <SupplierDetail
            supplier={selectedSupplier}
            onOrder={(offer) => {
              setDrawer(null);
              orderLinesFor([
                {
                  itemId: offer.itemId,
                  name: offer.item,
                  qty: 1,
                  unit: offer.pack,
                  unitPrice: offer.price,
                  supplierId: selectedSupplier.id,
                },
              ]);
            }}
            onRate={() => setModal("rate-supplier")}
          />
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "record"}
        title={
          selectedRecord
            ? `${selectedRecord.inputName} · ${selectedRecord.date}`
            : "Record"
        }
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setModal("duplicate-record")}
            >
              <Repeat /> Duplicate
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => setModal("edit-record")}
            >
              <Pencil /> Edit record
            </button>
          </div>
        }
      >
        {selectedRecord ? <RecordDetail row={selectedRecord} /> : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "price-history"}
        title={`${selectedItem?.name ?? "Input"} · price watch`}
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-block"
            onClick={() => {
              setDrawer(null);
              setModal("price-alert");
            }}
          >
            <BellRing /> Set a price alert
          </button>
        }
      >
        {selectedItem ? (
          <PriceHistoryPanel item={selectedItem} alerts={priceAlerts} />
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "orders"}
        title={`M-Pesa input orders · ${orders.length}`}
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-block"
            onClick={() => setModal("export")}
          >
            <Download /> Export order history
          </button>
        }
      >
        <OrdersPanel orders={orders} />
      </DashboardDrawer>

      {/* 1 — compare prices across suppliers */}
      <Dialog
        open={modal === "compare"}
        onClose={() => setModal(null)}
        title={`Compare prices · ${compareItem?.name ?? ""}`}
        desc="Live shelf prices from the GrowMO supplier directory around Githunguri."
        wide
      >
        {compareItem ? (
          <ComparePrices
            item={compareItem}
            onOrder={(line) => {
              setModal(null);
              orderLinesFor([line]);
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 2 — add / edit a purchase list line */}
      <Dialog
        open={modal === "add-to-list"}
        onClose={() => setModal(null)}
        title={
          selectedLine && selectedLine.id === selectedLineId
            ? `Edit · ${selectedLine.name}`
            : "Add to the AI purchase list"
        }
        desc="Quantity, deadline and preferred supplier — the list drives your next M-Pesa order."
        wide
      >
        <AddToListWizard
          item={
            selectedLine && selectedLine.id === selectedLineId
              ? (itemById(selectedLine.itemId) ?? selectedItem)
              : (itemById(selectedLineId) ?? selectedItem)
          }
          existing={
            selectedLine && selectedLine.id === selectedLineId
              ? selectedLine
              : null
          }
          suppliers={suppliers}
          onSave={(line) => {
            if (line.id === selectedLine?.id) {
              setPurchases((rows) =>
                rows.map((row) => (row.id === line.id ? line : row)),
              );
              setModal(null);
              toast.notify("Purchase line updated", "success");
            } else {
              addLine(line);
            }
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 3 — M-Pesa order wizard */}
      <Dialog
        open={modal === "order"}
        onClose={() => setModal(null)}
        title="Order inputs"
        desc={`${orderLines.length} line${orderLines.length === 1 ? "" : "s"} · simulated M-Pesa checkout`}
        wide
      >
        {orderLines.length ? (
          <OrderWizard
            lines={orderLines}
            suppliers={suppliers}
            onComplete={completeOrder}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 4 — adjust stock */}
      <Dialog
        open={modal === "adjust"}
        onClose={() => setModal(null)}
        title="Adjust stock"
        desc={selectedStock?.name}
        wide
      >
        {selectedStock ? (
          <AdjustStockWizard
            row={selectedStock}
            onSave={(delta, kind, reason) => {
              applyStockDelta(selectedStock.id, delta, kind, reason);
              setModal(null);
              setDrawer(null);
              toast.notify(
                `${selectedStock.name} adjusted — ${reason}`,
                "success",
              );
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 5 — record an application (deducts stock) */}
      <Dialog
        open={modal === "apply"}
        onClose={() => setModal(null)}
        title="Record input application"
        desc="Log what went into the soil — the store is deducted automatically."
        wide
      >
        <ApplicationWizard
          stock={stock}
          defaultStockId={selectedStock?.id ?? stock[0]?.id ?? ""}
          onSave={(record, stockId) => {
            setApplications((rows) => [record, ...rows]);
            applyStockDelta(
              stockId,
              -record.qty,
              "used",
              `${record.crop} · ${record.method} · ${record.appliedBy}`,
            );
            setModal(null);
            setDrawer(null);
            setView("application");
            toast.notify(
              `${record.inputName} logged on ${record.crop} and deducted from stock`,
              "success",
            );
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 6 — transfer stock between stores/plots */}
      <Dialog
        open={modal === "transfer"}
        onClose={() => setModal(null)}
        title="Transfer stock"
        desc={selectedStock?.name}
      >
        {selectedStock ? (
          <TransferWizard
            row={selectedStock}
            stores={stores}
            onSave={(storeId, note) => {
              const target = storeById(storeId);
              setStock((rows) =>
                rows.map((row) =>
                  row.id === selectedStock.id ? { ...row, storeId } : row,
                ),
              );
              setMovements((rows) => [
                {
                  id: `mov-tr-${Date.now()}`,
                  stockId: selectedStock.id,
                  kind: "transfer",
                  at: FARM_CONTEXT.today,
                  qty: `${selectedStock.onHand} ${selectedStock.unit}`,
                  by: FARM_CONTEXT.farmer,
                  note: `${storeById(selectedStock.storeId).name} → ${target.name}${note ? ` · ${note}` : ""}`,
                },
                ...rows,
              ]);
              setModal(null);
              setDrawer(null);
              toast.notify(
                `${selectedStock.name} moved to ${target.name}`,
                "success",
              );
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 7 — stocktake */}
      <Dialog
        open={modal === "stocktake"}
        onClose={() => setModal(null)}
        title="Stocktake"
        desc="Count the shelves, post the variances, and every movement is written to the log."
        wide
      >
        <StocktakeWizard
          stock={stock}
          onPost={(entries) => {
            let posted = 0;
            for (const entry of entries) {
              const row = stock.find((item) => item.id === entry.id);
              if (!row) continue;
              const delta =
                Math.round((entry.counted - row.onHand) * 100) / 100;
              if (delta === 0) continue;
              applyStockDelta(
                entry.id,
                delta,
                "adjusted",
                `Stocktake ${FARM_CONTEXT.today}`,
              );
              posted += 1;
            }
            setModal(null);
            setView("stock");
            toast.notify(
              posted
                ? `Stocktake posted · ${posted} line${posted === 1 ? "" : "s"} adjusted`
                : "Stocktake posted · counts match the books",
              "success",
            );
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 8 — add a stock line */}
      <Dialog
        open={modal === "new-item"}
        onClose={() => setModal(null)}
        title="Add a stock line"
        desc="Bring something you already own into the GrowMO store."
        wide
      >
        <NewItemWizard
          stores={stores}
          onSave={(row) => {
            setStock((rows) => [row, ...rows]);
            setMovements((movs) => [
              {
                id: `mov-new-${Date.now()}`,
                stockId: row.id,
                kind: "in",
                at: FARM_CONTEXT.today,
                qty: `+${row.onHand} ${row.unit}`,
                by: FARM_CONTEXT.farmer,
                note: "Added manually to the inventory",
              },
              ...movs,
            ]);
            setSelectedStockId(row.id);
            setModal(null);
            setView("stock");
            toast.notify(`${row.name} added to inventory`, "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 9 — delete an application record (destructive) */}
      <Dialog
        open={modal === "delete-record"}
        onClose={() => setModal(null)}
        title="Delete this application record?"
        desc="Traceability records are audited by buyers — only delete a genuine data-entry mistake."
      >
        {selectedRecord ? (
          <DeleteRecordConfirm
            row={selectedRecord}
            onCancel={() => setModal(null)}
            onDelete={() => {
              setApplications((rows) =>
                rows.filter((row) => row.id !== selectedRecord.id),
              );
              setModal(null);
              setDrawer(null);
              toast.notify("Application record deleted", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 10 — edit an application record */}
      <Dialog
        open={modal === "edit-record"}
        onClose={() => setModal(null)}
        title="Edit application record"
        desc={
          selectedRecord
            ? `${selectedRecord.crop} · ${selectedRecord.date}`
            : ""
        }
        wide
      >
        {selectedRecord ? (
          <EditRecordForm
            row={selectedRecord}
            onSave={(updated) => {
              setApplications((rows) =>
                rows.map((row) => (row.id === updated.id ? updated : row)),
              );
              setModal(null);
              setDrawer(null);
              toast.notify("Application record updated", "success");
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 11 — duplicate an application record */}
      <Dialog
        open={modal === "duplicate-record"}
        onClose={() => setModal(null)}
        title="Repeat this application?"
        desc="Useful for spray rounds on the same interval."
      >
        {selectedRecord ? (
          <DuplicateRecordConfirm
            row={selectedRecord}
            onCancel={() => setModal(null)}
            onSave={(date, assignee) => {
              const copy: ApplicationRow = {
                ...selectedRecord,
                id: `app-${Date.now()}`,
                date,
                appliedBy: assignee,
                notes: `Repeat of ${selectedRecord.date} application`,
              };
              setApplications((rows) => [copy, ...rows]);
              const repeatedStock = stock.find(
                (stockRow) => stockRow.name === selectedRecord.inputName,
              );
              if (repeatedStock) {
                applyStockDelta(
                  repeatedStock.id,
                  -copy.qty,
                  "used",
                  `${copy.crop} · repeated ${copy.method} · ${copy.appliedBy}`,
                );
              }
              setModal(null);
              setDrawer(null);
              toast.notify(`Repeat logged for ${date}`, "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 12 — rate a supplier */}
      <Dialog
        open={modal === "rate-supplier"}
        onClose={() => setModal(null)}
        title="Rate supplier"
        desc={selectedSupplier?.name}
      >
        {selectedSupplier ? (
          <RateSupplierForm
            supplier={selectedSupplier}
            onSave={(rating) => {
              setSuppliers((rows) =>
                rows.map((row) =>
                  row.id === selectedSupplier.id
                    ? {
                        ...row,
                        rating:
                          Math.round(
                            ((row.rating * row.reviews + rating) /
                              (row.reviews + 1)) *
                              10,
                          ) / 10,
                        reviews: row.reviews + 1,
                      }
                    : row,
                ),
              );
              setModal(null);
              setDrawer(null);
              toast.notify(
                `${selectedSupplier.name} rated ${rating}/5 — asante!`,
                "success",
              );
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 13 — low-stock alert settings */}
      <Dialog
        open={modal === "alert-settings"}
        onClose={() => setModal(null)}
        title="Low-stock alerts"
        desc="When GrowMO should warn you before a spray or top-dressing day."
      >
        <AlertSettingsForm
          settings={alerts}
          onSave={(next) => {
            setAlerts(next);
            setModal(null);
            toast.notify("Alert thresholds saved", "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 14 — supplier stock check */}
      <Dialog
        open={modal === "sync"}
        onClose={() => setModal(null)}
        title="Supplier stock check"
        desc="Pings the 10 registered agro-vets and refreshes shelf prices."
      >
        <SyncModal suppliers={suppliers} onClose={() => setModal(null)} />
      </Dialog>

      {/* 15 — export */}
      <Dialog
        open={modal === "export"}
        onClose={() => setModal(null)}
        title="Export inventory"
        desc="CSV for your accountant, plain text for WhatsApp to the co-op."
      >
        <ExportModal
          onExport={(scope, format) => {
            exportFile(scope, format);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 16 — regenerate the AI purchase list */}
      <Dialog
        open={modal === "ai-regen"}
        onClose={() => setModal(null)}
        title="Regenerate purchase list"
        desc="Pick the horizon and the crops the AI should plan for."
        wide
      >
        <AiRegenModal
          horizon={horizon}
          onSave={(nextHorizon, cropIds) => {
            setHorizon(nextHorizon);
            setPurchases(
              PURCHASE_SUGGESTIONS.filter(
                (line) =>
                  cropIds.length === 0 ||
                  cropIds.includes(line.category) ||
                  ["buy-07", "buy-08", "buy-09"].includes(line.id),
              ),
            );
            setModal(null);
            setView("purchase");
            toast.notify(
              `Purchase list rebuilt for the next ${nextHorizon} days`,
              "success",
            );
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 17 — swap supplier on a purchase line */}
      <Dialog
        open={modal === "swap"}
        onClose={() => setModal(null)}
        title="Choose another supplier"
        desc={selectedLine?.name}
        wide
      >
        {selectedLine ? (
          <SwapSupplierModal
            line={selectedLine}
            onSwap={(supplierId, price) => {
              const supplier = supplierById(supplierId);
              setPurchases((rows) =>
                rows.map((row) =>
                  row.id === selectedLine.id
                    ? {
                        ...row,
                        supplierId,
                        estCost: price * row.qty,
                        reason: `Switched to ${supplier.name} · ${supplier.distanceKm} km`,
                      }
                    : row,
                ),
              );
              setModal(null);
              toast.notify(`Now buying from ${supplier.name}`, "success");
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 18 — storage locations */}
      <Dialog
        open={modal === "stores"}
        onClose={() => setModal(null)}
        title="Storage locations"
        desc="Where every input physically lives — and how full each one is."
        wide
      >
        <StoresManager
          stores={stores}
          stock={stock}
          onSave={(next) => {
            setStores(next);
            setModal(null);
            toast.notify("Storage locations updated", "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 19 — price alert */}
      <Dialog
        open={modal === "price-alert"}
        onClose={() => setModal(null)}
        title="Set a price alert"
        desc={selectedItem ? `${selectedItem.name} · ${selectedItem.pack}` : ""}
      >
        <PriceAlertForm
          item={selectedItem}
          onSave={(alert) => {
            setPriceAlerts((rows) => [alert, ...rows]);
            setModal(null);
            setDrawer(null);
            toast.notify(
              `Alert set — SMS when ${alert.label} hits ${money(alert.target)}`,
              "success",
            );
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 20 — remove a purchase line (destructive) */}
      <Dialog
        open={modal === "delete-line"}
        onClose={() => setModal(null)}
        title="Remove from purchase list?"
        desc="The AI will suggest it again if the crop schedule still needs it."
      >
        {selectedLine ? (
          <DeleteLineConfirm
            line={selectedLine}
            onCancel={() => setModal(null)}
            onDelete={() => {
              setPurchases((rows) =>
                rows.filter((row) => row.id !== selectedLine.id),
              );
              setSelectedLineIds((ids) =>
                ids.filter((id) => id !== selectedLine.id),
              );
              setModal(null);
              toast.notify("Line removed from the purchase list", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 21 — batch and expiry */}
      <Dialog
        open={modal === "batch"}
        onClose={() => setModal(null)}
        title="Batch and expiry"
        desc={selectedStock?.name}
      >
        {selectedStock ? (
          <BatchForm
            row={selectedStock}
            onSave={(batch, expiry) => {
              setStock((rows) =>
                rows.map((row) =>
                  row.id === selectedStock.id ? { ...row, batch, expiry } : row,
                ),
              );
              setMovements((rows) => [
                {
                  id: `mov-batch-${Date.now()}`,
                  stockId: selectedStock.id,
                  kind: "adjusted",
                  at: FARM_CONTEXT.today,
                  qty: `batch ${batch}`,
                  by: FARM_CONTEXT.farmer,
                  note: expiry ? `Expiry set to ${expiry}` : "Expiry cleared",
                },
                ...rows,
              ]);
              setModal(null);
              setDrawer(null);
              toast.notify("Batch and expiry recorded", "success");
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 22 — add a supplier */}
      <Dialog
        open={modal === "add-supplier"}
        onClose={() => setModal(null)}
        title="Add a supplier"
        desc="Add your local agro-vet so GrowMO can price-check against them."
        wide
      >
        <AddSupplierWizard
          onSave={(supplier) => {
            setSuppliers((rows) => [supplier, ...rows]);
            setModal(null);
            setView("suppliers");
            toast.notify(`${supplier.name} added to the directory`, "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 23 — how the AI purchase list works */}
      <Dialog
        open={modal === "method"}
        onClose={() => setModal(null)}
        title="How the purchase list is built"
        desc="No magic — four inputs, checked every morning at 05:00."
      >
        <MethodModal
          onClose={() => setModal(null)}
          onOpenStock={() => {
            setModal(null);
            setView("stock");
          }}
        />
      </Dialog>
    </div>
  );
}

/* ==========================================================================
   5.1 — INPUT CATALOG
   ========================================================================== */

type InputCategoryFilter = InputCategory | "all";

const CROP_FILTERS = [
  "All crops",
  "Cabbage",
  "Maize",
  "Tomato",
  "Potato",
  "Dry beans",
  "Kale",
  "Greenhouse",
];

const CROP_KEYWORDS: Record<string, string[]> = {
  Cabbage: [
    "brassica",
    "cabbage",
    "black rot",
    "vegetable",
    "heading",
    "sulphur",
    "nitrogen",
  ],
  Maize: [
    "maize",
    "cereal",
    "armyworm",
    "broadleaf",
    "nitrogen",
    "pre-emergence",
    "wheat",
  ],
  Tomato: [
    "tomato",
    "blight",
    "vegetable",
    "greenhouse",
    "fruiting",
    "whiteflies",
    "aphids",
    "quality",
  ],
  Potato: ["potato", "root crop", "blight", "phosphorus", "low-phosphorus"],
  "Dry beans": ["bean", "legume", "rust", "cereal"],
  Kale: ["kale", "leafy", "brassica", "nitrogen", "diamond-back", "magnesium"],
  Greenhouse: ["greenhouse", "vegetable", "fruit", "flowering", "quality"],
};

function fitsCrop(item: CatalogItem, crop: string) {
  if (crop === "All crops") return true;
  const text =
    `${item.bestFor} ${item.spec} ${item.zones ?? ""} ${item.target ?? ""} ${item.use ?? ""} ${item.name}`.toLowerCase();
  return (CROP_KEYWORDS[crop] ?? []).some((word) => text.includes(word));
}

function CatalogView({
  category,
  query,
  crop,
  sort,
  page,
  inStockOnly,
  onCategory,
  onQuery,
  onCrop,
  onSort,
  onPage,
  onInStockOnly,
  onDetails,
  onCompare,
  onAdd,
  onPriceHistory,
}: {
  category: InputCategoryFilter;
  query: string;
  crop: string;
  sort: string;
  page: number;
  inStockOnly: boolean;
  onCategory: (value: InputCategoryFilter) => void;
  onQuery: (value: string) => void;
  onCrop: (value: string) => void;
  onSort: (value: string) => void;
  onPage: (value: number) => void;
  onInStockOnly: (value: boolean) => void;
  onDetails: (id: string) => void;
  onCompare: (id: string) => void;
  onAdd: (id: string) => void;
  onPriceHistory: (id: string) => void;
}) {
  const rows = useMemo(() => {
    const filtered = INPUT_CATALOG.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        `${item.name} ${item.spec} ${item.company} ${item.bestFor}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        fitsCrop(item, crop) &&
        (!inStockOnly || item.suppliersWithStock > 2),
    );
    const sorted = [...filtered];
    if (sort === "price-low") sorted.sort((a, b) => a.priceMin - b.priceMin);
    if (sort === "price-high") sorted.sort((a, b) => b.priceMax - a.priceMax);
    if (sort === "stock")
      sorted.sort((a, b) => b.suppliersWithStock - a.suppliersWithStock);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [category, query, crop, sort, inStockOnly]);

  const perPage = 9;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Section 5.1 · Catalog"
        title="Input catalog with live Kiambu prices"
        subtitle={`${INPUT_CATALOG.length} products across fertilizer, certified seed, crop protection, foliar feeds and farm consumables.`}
        action={
          <div className="gm-seg">
            {[
              { id: "name", label: "A–Z" },
              { id: "price-low", label: "Cheapest" },
              { id: "stock", label: "In stock" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={sort === option.id ? "on" : ""}
                onClick={() => onSort(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="gm-tabs" role="tablist" aria-label="Input categories">
        <button
          type="button"
          role="tab"
          aria-selected={category === "all"}
          className={`gm-tab ${category === "all" ? "on" : ""}`}
          onClick={() => onCategory("all")}
        >
          <Store /> All inputs
          <span className="gm-n">{INPUT_CATALOG.length}</span>
        </button>
        {(Object.keys(CATEGORY_LABEL) as InputCategory[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={category === key}
            className={`gm-tab ${category === key ? "on" : ""}`}
            onClick={() => onCategory(key)}
          >
            {CATEGORY_LABEL[key]}
            <span className="gm-n">{CATALOG_CATEGORIES[key]}</span>
          </button>
        ))}
      </div>

      <div className="gm-card p-3 mb-3">
        <div className="gm-form-grid cols3">
          <div className="gm-field full mb-0">
            <label className="gm-f-label" htmlFor="catalog-search">
              Search product, NPK, active ingredient or company
            </label>
            <div className="gm-search-field">
              <Search />
              <input
                id="catalog-search"
                className="gm-input"
                value={query}
                placeholder="Try “mancozeb”, “18:46:0”, “Simlaw”…"
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="gm-field mb-0">
            <label className="gm-f-label" htmlFor="catalog-crop">
              Crop fit
            </label>
            <select
              id="catalog-crop"
              className="gm-select"
              value={crop}
              onChange={(event) => onCrop(event.target.value)}
            >
              {CROP_FILTERS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="gm-field mb-0">
            <label className="gm-f-label" htmlFor="catalog-sort">
              Sort by
            </label>
            <select
              id="catalog-sort"
              className="gm-select"
              value={sort}
              onChange={(event) => onSort(event.target.value)}
            >
              <option value="name">Name (A–Z)</option>
              <option value="price-low">Lowest price</option>
              <option value="price-high">Highest price</option>
              <option value="stock">Most suppliers in stock</option>
            </select>
          </div>
          <div className="gm-field mb-0">
            <span className="gm-f-label">Availability</span>
            <Toggle
              checked={inStockOnly}
              onChange={onInStockOnly}
              label="3+ agro-vets in stock"
              desc="Only show inputs you can buy today"
            />
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <p className="text-muted mb-0" style={{ fontSize: "0.84rem" }}>
          Showing {visible.length} of {rows.length} products
          {crop !== "All crops" ? ` matched to ${crop}` : ""}
        </p>
        <span className="gm-chip">
          <MapPin /> {FARM_CONTEXT.location}
        </span>
      </div>

      {visible.length ? (
        <div className="row g-3">
          {visible.map((item) => (
            <div key={item.id} className="col-12 col-lg-6 col-xl-4">
              <CatalogCard
                item={item}
                unitPrice={bestOffer(item.id)?.offer.price ?? null}
                onDetails={() => onDetails(item.id)}
                onCompare={() => onCompare(item.id)}
                onAdd={() => onAdd(item.id)}
              />
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm gm-btn-block mt-2"
                onClick={() => onPriceHistory(item.id)}
              >
                <TrendingUp /> 6-month price history
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="gm-empty">
          <PackageOpen />
          <h3 className="font-display">No input matches that search</h3>
          <p>
            Try a different crop fit or clear the filters — the full catalog has{" "}
            {INPUT_CATALOG.length} products.
          </p>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              onQuery("");
              onCrop("All crops");
              onCategory("all");
              onInStockOnly(false);
            }}
          >
            <RefreshCw /> Reset filters
          </button>
        </div>
      )}

      <div className="mt-3">
        <Pagination
          page={Math.min(page, pages)}
          total={pages}
          onChange={onPage}
          perPage={perPage}
          totalItems={rows.length}
        />
      </div>
    </Reveal>
  );
}

/* ==========================================================================
   5.2 — MY INVENTORY (STOCK DASHBOARD)
   ========================================================================== */

function StockView({
  stock,
  movements,
  filter,
  query,
  page,
  stockValue,
  onFilter,
  onQuery,
  onPage,
  onOpen,
  onAdjust,
  onUsage,
  onTransfer,
  onOrder,
  onBatch,
  onStocktake,
  onNewItem,
  onRowMenu,
  rowMenu,
}: {
  stock: StockRow[];
  movements: StockMovement[];
  filter: StockStatus | "all";
  query: string;
  page: number;
  stockValue: number;
  onFilter: (value: StockStatus | "all") => void;
  onQuery: (value: string) => void;
  onPage: (value: number) => void;
  onOpen: (id: string) => void;
  onAdjust: (id: string) => void;
  onUsage: (id: string) => void;
  onTransfer: (id: string) => void;
  onOrder: (id: string) => void;
  onBatch: (id: string) => void;
  onStocktake: () => void;
  onNewItem: () => void;
  onRowMenu: (id: string | null) => void;
  rowMenu: string | null;
}) {
  const counts = {
    all: stock.length,
    ok: stock.filter((row) => stockStatus(row) === "ok").length,
    low: stock.filter((row) => stockStatus(row) === "low").length,
    out: stock.filter((row) => stockStatus(row) === "out").length,
  };
  const rows = stock.filter(
    (row) =>
      (filter === "all" || stockStatus(row) === filter) &&
      `${row.name} ${row.allocatedTo} ${row.batch}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  const recentMoves = movements.slice(0, 6);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Section 5.2 · Stock dashboard"
        title="My inventory"
        subtitle="Everything in the store, what it is allocated to, and what needs buying before the next spray day."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={onNewItem}
            >
              <Plus /> Add stock line
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onStocktake}
            >
              <PackageCheck /> Stocktake
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid mb-3">
        <DashboardMetric
          icon={Boxes}
          label="Stock value"
          value={money(stockValue)}
          note={`${stock.length} lines tracked`}
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Healthy stock"
          value={`${counts.ok}`}
          note="At or above reorder level"
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Low or out"
          value={`${counts.low + counts.out}`}
          note={`${counts.out} out · ${counts.low} below reorder`}
        />
        <DashboardMetric
          icon={Warehouse}
          label="Storage locations"
          value={`${new Set(stock.map((row) => row.storeId)).size}`}
          note={`${movements.length} movements on record`}
        />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {(
          [
            { id: "all", label: "All stock" },
            { id: "ok", label: "OK" },
            { id: "low", label: "Low" },
            { id: "out", label: "Out of stock" },
          ] as const
        ).map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`gm-filter-chip ${filter === chip.id ? "is-active" : ""}`}
            onClick={() => onFilter(chip.id)}
          >
            <Filter /> {chip.label}
            <span className="gm-n">{counts[chip.id]}</span>
          </button>
        ))}
        <div className="gm-search-field" style={{ flex: "1 1 240px" }}>
          <Search />
          <input
            className="gm-input"
            aria-label="Search stock"
            value={query}
            placeholder="Search stock, allocation or batch…"
            onChange={(event) => onQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Input</th>
              <th>On hand</th>
              <th>Reorder at</th>
              <th>Status</th>
              <th>Allocated to</th>
              <th>Storage</th>
              <th>Batch · Expiry</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const status = stockStatus(row);
              const store = STORES.find((item) => item.id === row.storeId);
              return (
                <tr key={row.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onOpen(row.id)}
                    >
                      {row.name}
                    </button>
                    <br />
                    <small className="text-muted">
                      {CATEGORY_SHORT[row.category]}
                    </small>
                  </td>
                  <td className="font-display">
                    {row.onHand} {row.unit}
                  </td>
                  <td>
                    {row.reorder} {row.unit}
                  </td>
                  <td>
                    <StatusChip
                      label={STOCK_STATUS_LABEL[status]}
                      tone={statusTone(status)}
                    />
                  </td>
                  <td>{row.allocatedTo}</td>
                  <td>{store?.name ?? "Unassigned"}</td>
                  <td>
                    {row.batch}
                    {row.expiry ? (
                      <>
                        <br />
                        <small className="text-muted">exp {row.expiry}</small>
                      </>
                    ) : null}
                  </td>
                  <td className="font-display">
                    {money(row.onHand * row.unitCost)}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Open ${row.name}`}
                        onClick={() => onOpen(row.id)}
                      >
                        <Eye />
                      </button>
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Record usage of ${row.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onUsage(row.id);
                        }}
                      >
                        <FlaskConical />
                      </button>
                      <div className="gm-dropdown">
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`More actions for ${row.name}`}
                          aria-expanded={rowMenu === row.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            onRowMenu(rowMenu === row.id ? null : row.id);
                          }}
                        >
                          <MoreHorizontal />
                        </button>
                        {rowMenu === row.id ? (
                          <div className="gm-menu">
                            <p className="gm-menuhead">{row.name}</p>
                            <button
                              type="button"
                              onClick={() => onAdjust(row.id)}
                            >
                              <Pencil /> Adjust stock
                            </button>
                            <button
                              type="button"
                              onClick={() => onTransfer(row.id)}
                            >
                              <Repeat /> Transfer store
                            </button>
                            <button
                              type="button"
                              onClick={() => onBatch(row.id)}
                            >
                              <CalendarDays /> Batch & expiry
                            </button>
                            <button
                              type="button"
                              onClick={() => onOrder(row.id)}
                            >
                              <ShoppingBag /> Reorder now
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Pagination
          page={Math.min(page, pages)}
          total={pages}
          onChange={onPage}
          perPage={perPage}
          totalItems={rows.length}
        />
      </div>

      <DashboardSectionHeader
        eyebrow="Stock movement"
        title="Latest store movements"
        subtitle="Every receipt, application and adjustment in date order."
      />
      <div className="row g-3">
        {recentMoves.map((movement) => (
          <div key={movement.id} className="col-12 col-lg-6">
            <div className="gm-check-row h-100 mb-0">
              <span className="gm-mega-icon">
                {movement.kind === "in" ? (
                  <ArrowDown />
                ) : movement.kind === "used" ? (
                  <FlaskConical />
                ) : movement.kind === "transfer" ? (
                  <Repeat />
                ) : movement.kind === "expired" ? (
                  <AlertTriangle />
                ) : (
                  <Pencil />
                )}
              </span>
              <span style={{ flex: 1 }}>
                <strong>
                  {MOVEMENT_LABEL[movement.kind]} · {movement.qty}
                </strong>
                <small>
                  {movement.note} · {movement.by} · {movement.at}
                </small>
              </span>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ==========================================================================
   5.3 — AI-GENERATED PURCHASE LIST
   ========================================================================== */

function PurchaseView({
  lines,
  allLines,
  selectedIds,
  horizon,
  orders,
  savingsTotal,
  onHorizon,
  onToggle,
  onOrderLine,
  onOrderSelected,
  onSwap,
  onEdit,
  onDelete,
  onRegenerate,
  onMethod,
  onSupplier,
  onItem,
  onRaiseManure,
  onBulkCan,
  onNozzles,
  onCompost,
}: {
  lines: PurchaseSuggestion[];
  allLines: PurchaseSuggestion[];
  selectedIds: string[];
  horizon: number;
  orders: OrderRecord[];
  savingsTotal: number;
  onHorizon: (value: number) => void;
  onToggle: (id: string) => void;
  onOrderLine: (line: PurchaseSuggestion) => void;
  onOrderSelected: () => void;
  onSwap: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: () => void;
  onMethod: () => void;
  onSupplier: (id: string) => void;
  onItem: (id: string) => void;
  onRaiseManure: () => void;
  onBulkCan: () => void;
  onNozzles: () => void;
  onCompost: () => void;
}) {
  const selected = lines.filter((line) => selectedIds.includes(line.id));
  const total = selected.reduce((sum, line) => sum + line.estCost, 0);
  const hidden = allLines.length - lines.length;

  const savingAction: Record<string, () => void> = {
    "save-01": onBulkCan,
    "save-02": onRaiseManure,
    "save-03": () => onSwap("buy-02"),
    "save-04": onCompost,
    "save-05": onNozzles,
  };

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Section 5.3 · AI purchase list"
        title="What to buy next, and when"
        subtitle="Built from your crop schedule, spray intervals, store levels and the Kiambu weather outlook."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={onMethod}
            >
              <Sparkles /> How it works
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onRegenerate}
            >
              <RefreshCw /> Regenerate list
            </button>
          </div>
        }
      />

      <div className="gm-plan-rec mb-3">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div>
            <strong className="font-display">
              Based on your crop schedule, buy these in the next {horizon} days
            </strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.88rem" }}>
              {lines.length} of {allLines.length} recommendations
              {hidden > 0 ? ` · ${hidden} planned beyond the window` : ""}.
              Total if you buy everything now:{" "}
              <strong className="font-display">
                {money(lines.reduce((sum, line) => sum + line.estCost, 0))}
              </strong>
              .
            </p>
          </div>
          <div className="gm-seg">
            {[14, 30, 60].map((days) => (
              <button
                key={days}
                type="button"
                className={horizon === days ? "on" : ""}
                onClick={() => onHorizon(days)}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
        <div className="d-flex flex-wrap gap-1 mt-3">
          {AI_REASONS.map((reason) => (
            <span key={reason} className="gm-chip">
              <Bot /> {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Input</th>
              <th>Quantity needed</th>
              <th>When</th>
              <th>Est. cost</th>
              <th>Suggested supplier</th>
              <th>Why</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const supplier = SUPPLIERS.find(
                (item) => item.id === line.supplierId,
              );
              return (
                <tr key={line.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${line.name}`}
                      checked={selectedIds.includes(line.id)}
                      onChange={() => onToggle(line.id)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onItem(line.itemId)}
                    >
                      {line.name}
                    </button>
                    <br />
                    <small className="text-muted">
                      {CATEGORY_LABEL[line.category]}
                    </small>
                  </td>
                  <td className="font-display">
                    {line.qty} {line.unit}
                    {line.bulkSaving ? (
                      <>
                        <br />
                        <small className="text-muted">
                          bulk saving {money(line.bulkSaving)}
                        </small>
                      </>
                    ) : null}
                  </td>
                  <td>
                    {line.needBy}
                    <br />
                    <small className="text-muted">in {line.daysOut} days</small>
                  </td>
                  <td className="font-display">{money(line.estCost)}</td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => supplier && onSupplier(supplier.id)}
                    >
                      {supplier?.name ?? "Choose supplier"}
                    </button>
                    <br />
                    <small className="text-muted">
                      {supplier?.distanceKm} km · {supplier?.town}
                    </small>
                  </td>
                  <td>
                    <StatusChip
                      label={line.priority.toUpperCase()}
                      tone={priorityTone(line.priority)}
                    />
                    <br />
                    <small className="text-muted">{line.reason}</small>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="gm-btn gm-btn-mpesa gm-btn-sm"
                        onClick={() => onOrderLine(line)}
                      >
                        <ShoppingBag /> Order
                      </button>
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Change supplier for ${line.name}`}
                        onClick={() => onSwap(line.id)}
                      >
                        <Repeat />
                      </button>
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Edit ${line.name}`}
                        onClick={() => onEdit(line.id)}
                      >
                        <Pencil />
                      </button>
                      <button
                        type="button"
                        className="gm-iconbtn danger"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => onDelete(line.id)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="gm-plan-total mt-3">
        <div>
          <small>
            {selected.length} line{selected.length === 1 ? "" : "s"} selected
          </small>
          <strong className="font-display">{money(total)}</strong>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!selected.length}
          onClick={onOrderSelected}
        >
          <ShoppingBag /> Pay with M-Pesa · {money(total)}
        </button>
      </div>

      <DashboardSectionHeader
        eyebrow="Section 5.6 link · Savings"
        title={`Savings opportunities · ${money(savingsTotal)} available`}
        subtitle="Same inputs, less money — bulk pallets, closer suppliers and your own compost heap."
      />
      <div className="row g-3">
        {SAVINGS.map((saving) => (
          <div key={saving.id} className="col-12 col-lg-6">
            <div className="gm-check-row h-100 mb-0">
              <span className="gm-mega-icon">
                <PiggyBank />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{saving.title}</strong>
                <small>{saving.detail}</small>
                <small className="d-block mt-1">
                  <span className="gm-chip gm-chip-gold">
                    <Coins /> Save {money(saving.saving)}
                  </span>
                </small>
              </span>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={savingAction[saving.id] ?? onRegenerate}
              >
                {saving.actionLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length ? (
        <>
          <DashboardSectionHeader
            eyebrow="Confirmed"
            title="Recent M-Pesa input orders"
            subtitle="Settled orders restock the store automatically."
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Supplier</th>
                  <th>Lines</th>
                  <th>Fulfilment</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-display">{order.receipt}</td>
                    <td>{order.supplier}</td>
                    <td>
                      {order.lines
                        .map((line) => `${line.qty} ${line.unit} ${line.name}`)
                        .join(" · ")}
                    </td>
                    <td>{order.fulfilment}</td>
                    <td className="font-display">{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Reveal>
  );
}

/* ==========================================================================
   5.4 — INPUT APPLICATION LOG
   ========================================================================== */

function ApplicationView({
  rows,
  crop,
  query,
  method,
  page,
  onCrop,
  onQuery,
  onMethod,
  onPage,
  onOpen,
  onAdd,
  onEdit,
  onDuplicate,
  onDelete,
  onLogScheduled,
}: {
  rows: ApplicationRow[];
  crop: string;
  query: string;
  method: string;
  page: number;
  onCrop: (value: string) => void;
  onQuery: (value: string) => void;
  onMethod: (value: string) => void;
  onPage: (value: number) => void;
  onOpen: (id: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onLogScheduled: () => void;
}) {
  const crops = ["All crops", ...new Set(rows.map((row) => row.crop))];
  const filtered = rows.filter(
    (row) =>
      (crop === "All crops" || row.crop === crop) &&
      (method === "All methods" || row.method === method) &&
      `${row.inputName} ${row.crop} ${row.appliedBy} ${row.notes}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const spend = filtered.reduce((sum, row) => sum + row.cost, 0);
  const blocked = SCHEDULED_APPLICATIONS.filter(
    (entry) => entry.stockId === "stk-02",
  );

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Section 5.4 · Traceability"
        title="Input application log"
        subtitle="Every spray, top-dress and basal dressing — the record buyers and certifiers ask for."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onAdd}
          >
            <Plus /> Record application
          </button>
        }
      />

      <div className="gm-stat-grid mb-3">
        <DashboardMetric
          icon={ClipboardList}
          label="Applications logged"
          value={`${filtered.length}`}
          note={crop === "All crops" ? "Across all crops" : crop}
        />
        <DashboardMetric
          icon={Coins}
          label="Input cost logged"
          value={money(spend)}
          note="Recorded at application date"
        />
        <DashboardMetric
          icon={ShieldCheck}
          label="PHI active"
          value={`${filtered.filter((row) => row.phiDays).length}`}
          note="Records with a pre-harvest interval"
        />
        <DashboardMetric
          icon={CalendarClock}
          label="Scheduled next"
          value="15 Nov"
          note="CAN top dress · blocked on stock"
        />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {crops.map((option) => (
          <button
            key={option}
            type="button"
            className={`gm-filter-chip ${crop === option ? "is-active" : ""}`}
            onClick={() => onCrop(option)}
          >
            <Wheat /> {option}
            <span className="gm-n">
              {option === "All crops"
                ? rows.length
                : rows.filter((row) => row.crop === option).length}
            </span>
          </button>
        ))}
      </div>

      <div className="gm-form-grid mb-3">
        <div className="gm-field mb-0">
          <label className="gm-f-label" htmlFor="log-search">
            Search the log
          </label>
          <div className="gm-search-field">
            <Search />
            <input
              id="log-search"
              className="gm-input"
              value={query}
              placeholder="Input, worker or note…"
              onChange={(event) => onQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="gm-field mb-0">
          <label className="gm-f-label" htmlFor="log-method">
            Application method
          </label>
          <select
            id="log-method"
            className="gm-select"
            value={method}
            onChange={(event) => onMethod(event.target.value)}
          >
            <option>All methods</option>
            {APPLICATION_METHODS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Crop · plot</th>
              <th>Input</th>
              <th>Quantity used</th>
              <th>Rate / acre</th>
              <th>Method</th>
              <th>Applied by</th>
              <th>Weather</th>
              <th>PHI safe from</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>
                  <strong>{row.crop}</strong>
                  <br />
                  <small className="text-muted">{row.plot}</small>
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => onOpen(row.id)}
                  >
                    {row.inputName}
                  </button>
                  <br />
                  <small className="text-muted">
                    {CATEGORY_SHORT[row.category]}
                  </small>
                </td>
                <td className="font-display">
                  {row.qty} {row.unit}
                </td>
                <td>{row.ratePerAcre}</td>
                <td>{row.method}</td>
                <td>{row.appliedBy}</td>
                <td>
                  <span className="gm-chip">
                    <CloudSun /> {row.weather} · {row.tempC}°C
                  </span>
                </td>
                <td>
                  {row.safeUntil ? (
                    <StatusChip label={row.safeUntil} tone="medium" />
                  ) : (
                    <StatusChip label="No PHI" tone="low" />
                  )}
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="gm-iconbtn"
                      aria-label={`Open record ${row.date}`}
                      onClick={() => onOpen(row.id)}
                    >
                      <Eye />
                    </button>
                    <button
                      type="button"
                      className="gm-iconbtn"
                      aria-label={`Edit record ${row.date}`}
                      onClick={() => onEdit(row.id)}
                    >
                      <Pencil />
                    </button>
                    <button
                      type="button"
                      className="gm-iconbtn"
                      aria-label={`Duplicate record ${row.date}`}
                      onClick={() => onDuplicate(row.id)}
                    >
                      <Repeat />
                    </button>
                    <button
                      type="button"
                      className="gm-iconbtn danger"
                      aria-label={`Delete record ${row.date}`}
                      onClick={() => onDelete(row.id)}
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

      <div className="mt-3">
        <Pagination
          page={Math.min(page, pages)}
          total={pages}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>

      <DashboardSectionHeader
        eyebrow="Up next"
        title="Scheduled applications"
        subtitle="Planned spray and feeding rounds — blocked ones point straight at the purchase list."
      />
      <div className="row g-3">
        {SCHEDULED_APPLICATIONS.map((entry) => {
          const isBlocked = blocked.some((item) => item.id === entry.id);
          return (
            <div key={entry.id} className="col-12 col-lg-4">
              <article className="gm-card p-3 h-100">
                <span className="gm-eyebrow">{entry.date}</span>
                <h3 className="font-display mb-1">{entry.inputName}</h3>
                <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                  {entry.crop} · {entry.method} · {entry.ratePerAcre}
                </p>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  <span className="gm-chip">
                    <User /> {entry.assignee}
                  </span>
                  <StatusChip
                    label={isBlocked ? "Blocked · no stock" : "Stock ready"}
                    tone={isBlocked ? "high" : "low"}
                  />
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
                  {entry.note}
                </p>
                <div className="d-flex flex-wrap gap-2 mt-auto">
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime gm-btn-sm"
                    onClick={onLogScheduled}
                  >
                    <FlaskConical /> Log it now
                  </button>
                  <Link
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    to="/app/crops"
                  >
                    <Sprout /> Crop tracker
                  </Link>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ==========================================================================
   5.5 — SUPPLIER DIRECTORY
   ========================================================================== */

function SupplierView({
  suppliers,
  type,
  query,
  sort,
  layout,
  onType,
  onQuery,
  onSort,
  onLayout,
  onOpen,
  onRate,
  onOrder,
  onAdd,
}: {
  suppliers: Supplier[];
  type: string;
  query: string;
  sort: string;
  layout: "cards" | "table";
  onType: (value: string) => void;
  onQuery: (value: string) => void;
  onSort: (value: string) => void;
  onLayout: (value: "cards" | "table") => void;
  onOpen: (id: string) => void;
  onRate: (id: string) => void;
  onOrder: (id: string) => void;
  onAdd: () => void;
}) {
  const types = ["All suppliers", ...new Set(suppliers.map((row) => row.type))];
  const rows = suppliers
    .filter(
      (supplier) =>
        (type === "All suppliers" || supplier.type === type) &&
        `${supplier.name} ${supplier.town} ${supplier.products.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating
        : sort === "price"
          ? a.offers[0].price - b.offers[0].price
          : a.distanceKm - b.distanceKm,
    );

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Section 5.5 · Directory"
        title="Supplier directory"
        subtitle="Ten registered agro-vets, seed companies and bulk suppliers around Githunguri with verified shelf prices."
        action={
          <div className="d-flex flex-wrap gap-2">
            <div className="gm-seg">
              <button
                type="button"
                className={layout === "cards" ? "on" : ""}
                onClick={() => onLayout("cards")}
              >
                Cards
              </button>
              <button
                type="button"
                className={layout === "table" ? "on" : ""}
                onClick={() => onLayout("table")}
              >
                Table
              </button>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onAdd}
            >
              <Plus /> Add supplier
            </button>
          </div>
        }
      />

      <div className="d-flex flex-wrap gap-2 mb-3">
        {types.map((option) => (
          <button
            key={option}
            type="button"
            className={`gm-filter-chip ${type === option ? "is-active" : ""}`}
            onClick={() => onType(option)}
          >
            <Truck /> {option}
            <span className="gm-n">
              {option === "All suppliers"
                ? suppliers.length
                : suppliers.filter((row) => row.type === option).length}
            </span>
          </button>
        ))}
        <div className="gm-search-field" style={{ flex: "1 1 240px" }}>
          <Search />
          <input
            className="gm-input"
            aria-label="Search suppliers"
            value={query}
            placeholder="Search supplier, town or product…"
            onChange={(event) => onQuery(event.target.value)}
          />
        </div>
        <select
          className="gm-select"
          aria-label="Sort suppliers"
          style={{ maxWidth: 210 }}
          value={sort}
          onChange={(event) => onSort(event.target.value)}
        >
          <option value="distance">Nearest first</option>
          <option value="rating">Best rated</option>
          <option value="price">Cheapest shelf price</option>
        </select>
      </div>

      {layout === "cards" ? (
        <div className="row g-3">
          {rows.map((supplier) => (
            <div key={supplier.id} className="col-12 col-lg-6 col-xl-4">
              <article className="gm-card p-3 h-100 d-flex flex-column">
                <div className="d-flex align-items-start gap-3">
                  <span className="gm-mega-icon">
                    <Building2 />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="gm-eyebrow">{supplier.type}</span>
                    <h3 className="font-display mb-1">{supplier.name}</h3>
                    <div className="d-flex flex-wrap gap-1">
                      <span className="gm-chip">
                        <MapPin /> {supplier.distanceKm} km · {supplier.town}
                      </span>
                      <StatusChip
                        label={supplier.verified ? "Verified" : "Not verified"}
                        tone={supplier.verified ? "low" : "medium"}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 mt-3">
                  <Stars rating={supplier.rating} />
                  <strong className="font-display">
                    {supplier.rating.toFixed(1)}
                  </strong>
                  <small className="text-muted">
                    {supplier.reviews} farmer reviews
                  </small>
                </div>

                <div className="gm-check-row mt-3">
                  <PackageCheck />
                  <span style={{ flex: 1 }}>
                    <small>Shelf today</small>
                    <strong>
                      {supplier.offers[0]
                        ? `${supplier.offers[0].item} · ${money(supplier.offers[0].price)}`
                        : "Ask for a quote"}
                    </strong>
                  </span>
                </div>

                <p
                  className="text-muted mb-2 mt-2"
                  style={{ fontSize: "0.82rem" }}
                >
                  {supplier.hours} · {supplier.minOrder} ·{" "}
                  {supplier.deliveryNote}
                </p>

                <div className="d-flex flex-wrap gap-2 mt-auto">
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={() => onOpen(supplier.id)}
                  >
                    Catalogue <ArrowRight />
                  </button>
                  <a
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    href={telHref(supplier.phone)}
                  >
                    <Phone /> Call
                  </a>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime gm-btn-sm"
                    onClick={() => onOrder(supplier.id)}
                  >
                    <ShoppingBag /> Order
                  </button>
                  <button
                    type="button"
                    className="gm-iconbtn"
                    aria-label={`Rate ${supplier.name}`}
                    onClick={() => onRate(supplier.id)}
                  >
                    <Sparkles />
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      ) : (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Type</th>
                <th>Location</th>
                <th>Distance</th>
                <th>Phone</th>
                <th>Products</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onOpen(supplier.id)}
                    >
                      {supplier.name}
                    </button>
                    <br />
                    <small className="text-muted">{supplier.till}</small>
                  </td>
                  <td>{supplier.type}</td>
                  <td>
                    {supplier.town}
                    <br />
                    <small className="text-muted">
                      {supplier.county} County
                    </small>
                  </td>
                  <td className="font-display">{supplier.distanceKm} km</td>
                  <td>
                    <a href={telHref(supplier.phone)}>{supplier.phone}</a>
                  </td>
                  <td>{supplier.products.join(", ")}</td>
                  <td>
                    <Stars rating={supplier.rating} />
                    <br />
                    <small className="text-muted">
                      {supplier.rating.toFixed(1)}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Open ${supplier.name}`}
                        onClick={() => onOpen(supplier.id)}
                      >
                        <Eye />
                      </button>
                      <a
                        className="gm-iconbtn"
                        aria-label={`Call ${supplier.name}`}
                        href={telHref(supplier.phone)}
                      >
                        <Phone />
                      </a>
                      <a
                        className="gm-iconbtn"
                        aria-label={`Directions to ${supplier.name}`}
                        href={mapsHref(supplier.mapQuery)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MapPin />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Reveal>
  );
}

/* ==========================================================================
   5.6 — INPUT COST ANALYTICS
   ========================================================================== */

const DONUT_COLORS = [
  "var(--gm-leaf-600)",
  "var(--gm-lime-500)",
  "var(--gm-clay-500)",
  "var(--gm-gold-500)",
];

function AnalyticsView({
  seasonSpend,
  applicationSpend,
  trendKey,
  alerts,
  priceAlerts,
  stockValue,
  onTrend,
  onPriceAlert,
  onAlertSettings,
  onExport,
  onBulkCan,
  onRaiseManure,
  onSwap,
  onCompost,
  onOrderNozzles,
}: {
  seasonSpend: number;
  applicationSpend: number;
  trendKey: PriceTrendKey;
  alerts: AlertSettings;
  priceAlerts: PriceAlert[];
  stockValue: number;
  onTrend: (value: PriceTrendKey) => void;
  onPriceAlert: () => void;
  onAlertSettings: () => void;
  onExport: () => void;
  onBulkCan: () => void;
  onRaiseManure: () => void;
  onSwap: (id: string) => void;
  onCompost: () => void;
  onOrderNozzles: () => void;
}) {
  const totalCost = COST_BY_CATEGORY.reduce((sum, row) => sum + row.amount, 0);
  const acresNow =
    SEASON_COSTS.find((row) => row.id === "season-2026s")?.acres ?? 2.1;
  const savingAction: Record<string, () => void> = {
    "save-01": onBulkCan,
    "save-02": onRaiseManure,
    "save-03": () => onSwap("buy-02"),
    "save-04": onCompost,
    "save-05": onOrderNozzles,
  };

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Section 5.6 · Analytics"
        title="Input cost analytics"
        subtitle="Where the season's input money actually went, and where the next shilling can be saved."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onExport}
          >
            <Download /> Export analytics
          </button>
        }
      />

      <div className="gm-stat-grid mb-3">
        <DashboardMetric
          icon={Coins}
          label="Season input spend"
          value={money(seasonSpend)}
          note={`${acresNow} acres under production`}
        />
        <DashboardMetric
          icon={Gauge}
          label="Cost per acre"
          value={money(seasonSpend / acresNow)}
          note="Fertilizer, protection, seed, manure"
        />
        <DashboardMetric
          icon={Boxes}
          label="Stock on hand"
          value={money(stockValue)}
          note="At last purchase price"
        />
        <DashboardMetric
          icon={FlaskConical}
          label="Logged to crops"
          value={money(applicationSpend)}
          note={`${applicationSpend ? "Reconciled to the application log" : "Nothing logged yet"}`}
        />
      </div>

      <div className="gm-card p-3 mb-3">
        <DashboardSectionHeader
          eyebrow="Cost by category"
          title="How the input budget splits"
          subtitle="Short rains 2026 to date — fertilizer still dominates, exactly as the soil test predicted."
        />
        <DonutChart
          slices={COST_BY_CATEGORY.map((row, index) => ({
            id: row.id,
            label: row.label,
            value: row.amount,
            color: DONUT_COLORS[index % DONUT_COLORS.length],
            note: row.note,
          }))}
          centerLabel="total inputs"
          centerValue={money(totalCost).replace("KES ", "")}
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="gm-card p-3 h-100">
            <DashboardSectionHeader
              eyebrow="Cost per acre"
              title="Three seasons compared"
              subtitle="Input cost per acre, all crops combined."
            />
            <BarChart
              unitLabel="KES per acre · fertilizer + protection + seed + manure"
              formatValue={(value) => money(value).replace("KES ", "")}
              rows={SEASON_COSTS.map((season) => {
                const total =
                  season.fertilizer +
                  season.protection +
                  season.seeds +
                  season.manure;
                return {
                  id: season.id,
                  label: season.season.replace("20", "'"),
                  sub: `${season.acres} acres`,
                  value: Math.round(total / season.acres),
                  highlight: season.id === "season-2026s",
                };
              })}
            />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="gm-card p-3 h-100">
            <DashboardSectionHeader
              eyebrow="Price trends"
              title="Last six months"
              subtitle="Shelf price in Kiambu — buy before the January rush."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onPriceAlert}
                >
                  <BellRing /> Price alert
                </button>
              }
            />
            <div className="gm-seg mb-3">
              {PRICE_TREND_SERIES.map((series) => (
                <button
                  key={series.key}
                  type="button"
                  className={trendKey === series.key ? "on" : ""}
                  onClick={() => onTrend(series.key)}
                >
                  {series.label}
                </button>
              ))}
            </div>
            <TrendChart
              color={
                trendKey === "dap"
                  ? "var(--gm-leaf-600)"
                  : trendKey === "can"
                    ? "var(--gm-gold-500)"
                    : trendKey === "urea"
                      ? "var(--gm-clay-500)"
                      : "var(--gm-forest-800)"
              }
              formatValue={(value) => money(value)}
              points={PRICE_TRENDS.map((row) => ({
                label: row.month,
                value: row[trendKey],
              }))}
            />
            <div className="gm-plan-rec mt-3">
              <strong>
                {
                  PRICE_TREND_SERIES.find((series) => series.key === trendKey)
                    ?.label
                }{" "}
                moved{" "}
                {PRICE_TRENDS[PRICE_TRENDS.length - 1][trendKey] >
                PRICE_TRENDS[0][trendKey]
                  ? "up"
                  : "down"}{" "}
                {money(
                  Math.abs(
                    PRICE_TRENDS[PRICE_TRENDS.length - 1][trendKey] -
                      PRICE_TRENDS[0][trendKey],
                  ),
                )}{" "}
                in six months
              </strong>
              <p className="mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
                GrowMO buys for you when a price alert triggers — the SMS goes
                to {FARM_CONTEXT.phone}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DashboardSectionHeader
        eyebrow="Season ledger"
        title="Input spend by season"
        subtitle="Everything purchased, split by category, with the yield each season delivered."
      />
      <div className="gm-table-wrap mb-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>Window</th>
              <th>Acres</th>
              <th>Fertilizer</th>
              <th>Protection</th>
              <th>Seed</th>
              <th>Manure</th>
              <th>Total</th>
              <th>Per acre</th>
              <th>Yield outcome</th>
            </tr>
          </thead>
          <tbody>
            {SEASON_COSTS.map((season) => {
              const total =
                season.fertilizer +
                season.protection +
                season.seeds +
                season.manure;
              return (
                <tr key={season.id}>
                  <td>
                    <strong>{season.season}</strong>
                  </td>
                  <td>{season.window}</td>
                  <td className="font-display">{season.acres}</td>
                  <td className="font-display">{money(season.fertilizer)}</td>
                  <td className="font-display">{money(season.protection)}</td>
                  <td className="font-display">{money(season.seeds)}</td>
                  <td className="font-display">{money(season.manure)}</td>
                  <td className="font-display">
                    <strong>{money(total)}</strong>
                  </td>
                  <td className="font-display">
                    {money(total / season.acres)}
                  </td>
                  <td>{season.yieldNote}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="gm-card p-3 h-100">
            <DashboardSectionHeader
              eyebrow="Savings opportunities"
              title="Five ways to spend less this season"
            />
            {SAVINGS.map((saving) => (
              <div key={saving.id} className="gm-check-row">
                <span className="gm-mega-icon">
                  <TrendingDown />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>{saving.title}</strong>
                  <small>{saving.detail}</small>
                </span>
                <div className="text-end">
                  <strong className="font-display d-block">
                    {money(saving.saving)}
                  </strong>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm mt-1"
                    onClick={savingAction[saving.id] ?? onExport}
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="gm-card p-3 h-100">
            <DashboardSectionHeader
              eyebrow="Alerts"
              title="What GrowMO is watching"
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onAlertSettings}
                >
                  <Settings2 /> Thresholds
                </button>
              }
            />
            <div className="gm-check-row">
              <BellRing />
              <span style={{ flex: 1 }}>
                <strong>Reorder threshold</strong>
                <small>
                  Warn at {alerts.reorderAtPercent}% of the reorder level ·
                  expiry {alerts.expiryWarningDays} days · price move{" "}
                  {alerts.priceDropPercent}%
                </small>
              </span>
            </div>
            {priceAlerts.map((alert) => (
              <div key={alert.id} className="gm-check-row">
                <TrendingDown />
                <span style={{ flex: 1 }}>
                  <strong>
                    {alert.label} {alert.direction} {money(alert.target)}
                  </strong>
                  <small>SMS to {alert.phone}</small>
                </span>
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={onPriceAlert}
                >
                  <Plus /> New alert
                </button>
              </div>
            ))}
            <div className="gm-check-row">
              <Smartphone />
              <span style={{ flex: 1 }}>
                <strong>Delivery channel</strong>
                <small>
                  {alerts.smsAlerts ? "SMS on" : "SMS off"} ·{" "}
                  {alerts.whatsappAlerts ? "WhatsApp on" : "WhatsApp off"} ·{" "}
                  {alerts.autoPurchaseList
                    ? "purchase list refreshes daily"
                    : "manual purchase list"}
                </small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ==========================================================================
   DRAWER CONTENT
   ========================================================================== */

function ItemDetail({ item }: { item: CatalogItem }) {
  const offers = offersFor(item.id);
  const cheapest = offers[0]?.offer.price ?? null;
  const latest =
    item.priceHistory[item.priceHistory.length - 1] ?? item.priceMax;
  const first = item.priceHistory[0] ?? item.priceMax;
  const change = Math.round(((latest - first) / first) * 100);

  return (
    <div>
      <div className="d-flex flex-wrap gap-1 mb-3">
        <StatusChip label={CATEGORY_LABEL[item.category]} tone="low" />
        {item.organic ? <StatusChip label="Organic" tone="low" /> : null}
        {item.certified ? (
          <StatusChip label="Certified seed" tone="low" />
        ) : null}
        {item.phi ? (
          <StatusChip label={`PHI ${item.phi}`} tone="medium" />
        ) : null}
        <span className="gm-chip">
          <Store /> {item.suppliersWithStock} agro-vets in stock
        </span>
      </div>

      <div className="gm-table-wrap mb-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Specification</td>
              <td>
                <strong>{item.spec}</strong>
              </td>
            </tr>
            <tr>
              <td>Supplier brand</td>
              <td>{item.company}</td>
            </tr>
            <tr>
              <td>Pack size</td>
              <td>{item.pack}</td>
            </tr>
            <tr>
              <td>Market price range</td>
              <td className="font-display">
                {item.priceMin === item.priceMax
                  ? money(item.priceMin)
                  : `${money(item.priceMin)} – ${money(item.priceMax)}`}
              </td>
            </tr>
            {cheapest ? (
              <tr>
                <td>Cheapest near you</td>
                <td className="font-display">
                  <strong>{money(cheapest)}</strong> · {offers[0].supplier.name}
                </td>
              </tr>
            ) : null}
            <tr>
              <td>Recommended rate</td>
              <td>{item.rate}</td>
            </tr>
            {item.maturity ? (
              <tr>
                <td>Maturity · zones</td>
                <td>
                  {item.maturity} · {item.zones}
                </td>
              </tr>
            ) : null}
            {item.target ? (
              <tr>
                <td>Active ingredient</td>
                <td>
                  {item.active} · targets {item.target}
                </td>
              </tr>
            ) : null}
            {item.use ? (
              <tr>
                <td>Use stage</td>
                <td>{item.use}</td>
              </tr>
            ) : null}
            <tr>
              <td>Storage</td>
              <td>{item.storage}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="gm-plan-rec mb-3">
        <strong>Agro note</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.88rem" }}>
          {item.caution}
        </p>
      </div>

      <div className="gm-check-row">
        <span className="gm-mega-icon">
          <TrendingUp />
        </span>
        <span style={{ flex: 1 }}>
          <strong>
            Six-month price {change >= 0 ? "up" : "down"} {Math.abs(change)}%
          </strong>
          <small>
            {money(first)} in Jun 2026 → {money(latest)} in Nov 2026
          </small>
        </span>
        <Sparkline values={item.priceHistory} />
      </div>

      <DashboardSectionHeader eyebrow="Where to buy" title="Supplier offers" />
      {offers.length ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Pack</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(({ supplier, offer }) => (
                <tr key={`${supplier.id}-${offer.itemId}`}>
                  <td>
                    <strong>{supplier.name}</strong>
                    <br />
                    <small className="text-muted">
                      {supplier.distanceKm} km · {supplier.town}
                    </small>
                  </td>
                  <td>{offer.pack}</td>
                  <td className="font-display">{money(offer.price)}</td>
                  <td>{offer.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="gm-empty">
          <Store />
          <h3 className="font-display">No listed shelf price</h3>
          <p>
            None of the ten registered suppliers publish a price for this input.
            Call Githunguri Farmers Agrovet on 0722 115 480 for a quote.
          </p>
          <a className="gm-btn gm-btn-outline" href={telHref("0722 115 480")}>
            <Phone /> Call for a quote
          </a>
        </div>
      )}
    </div>
  );
}

function StockDetail({
  row,
  store,
  movements,
  onTransfer,
  onBatch,
  onOrder,
}: {
  row: StockRow;
  store: StoreLocation;
  movements: StockMovement[];
  onTransfer: () => void;
  onBatch: () => void;
  onOrder: () => void;
}) {
  const status = stockStatus(row);
  return (
    <div>
      <StockMeter onHand={row.onHand} reorder={row.reorder} unit={row.unit} />

      <div className="d-flex flex-wrap gap-1 mb-3">
        <StatusChip
          label={STOCK_STATUS_LABEL[status]}
          tone={statusTone(status)}
        />
        <span className="gm-chip">
          <Warehouse /> {store.name}
        </span>
        <span className="gm-chip">
          <CalendarDays /> Updated {row.lastUpdated}
        </span>
      </div>

      <div className="gm-table-wrap mb-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Allocated to</td>
              <td>
                <strong>{row.allocatedTo}</strong>
              </td>
            </tr>
            <tr>
              <td>Storage conditions</td>
              <td>{store.condition}</td>
            </tr>
            <tr>
              <td>Batch</td>
              <td>{row.batch}</td>
            </tr>
            <tr>
              <td>Expiry</td>
              <td>{row.expiry ?? "Not applicable"}</td>
            </tr>
            <tr>
              <td>Unit cost</td>
              <td className="font-display">{money(row.unitCost)}</td>
            </tr>
            <tr>
              <td>Stock value</td>
              <td className="font-display">
                <strong>{money(row.onHand * row.unitCost)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {status !== "ok" ? (
        <div className="gm-plan-rec mb-3">
          <strong>
            {status === "out" ? "Out of stock" : "Below the reorder level"}
          </strong>
          <p className="mb-0 mt-1" style={{ fontSize: "0.88rem" }}>
            {row.allocatedTo} will stall without it. GrowMO priced the refill at{" "}
            {money(bestOffer(row.itemId)?.offer.price ?? row.unitCost)} from{" "}
            {bestOffer(row.itemId)?.supplier.name ?? "the nearest agro-vet"}.
          </p>
        </div>
      ) : null}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onTransfer}
        >
          <Repeat /> Transfer store
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onBatch}
        >
          <CalendarDays /> Batch & expiry
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onOrder}
        >
          <ShoppingBag /> Reorder now
        </button>
      </div>

      <DashboardSectionHeader eyebrow="Audit trail" title="Movement history" />
      {movements.length ? (
        <div className="gm-timeline">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className={`gm-tl-item ${movement.kind === "in" ? "is-done" : movement.kind === "used" ? "is-current" : ""}`}
            >
              <span className="gm-mega-icon">
                {movement.kind === "in" ? (
                  <ArrowDown />
                ) : movement.kind === "used" ? (
                  <FlaskConical />
                ) : movement.kind === "transfer" ? (
                  <Repeat />
                ) : movement.kind === "expired" ? (
                  <AlertTriangle />
                ) : (
                  <Pencil />
                )}
              </span>
              <span style={{ flex: 1 }}>
                <strong>
                  {MOVEMENT_LABEL[movement.kind]} · {movement.qty}
                </strong>
                <small>
                  {movement.note} · {movement.by}
                </small>
              </span>
              <small className="text-muted">{movement.at}</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="gm-empty">
          <Activity />
          <h3 className="font-display">No movements yet</h3>
          <p>
            Record an application or run a stocktake and the audit trail fills
            in here.
          </p>
        </div>
      )}
    </div>
  );
}

function SupplierDetail({
  supplier,
  onOrder,
  onRate,
}: {
  supplier: Supplier;
  onOrder: (offer: Supplier["offers"][number]) => void;
  onRate: () => void;
}) {
  return (
    <div>
      <div className="d-flex flex-wrap gap-1 mb-3">
        <StatusChip label={supplier.type} tone="low" />
        <StatusChip
          label={
            supplier.verified ? "Verified by GrowMO" : "Verification pending"
          }
          tone={supplier.verified ? "low" : "medium"}
        />
        <span className="gm-chip">
          <MapPin /> {supplier.distanceKm} km · {supplier.county}
        </span>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3">
        <Stars rating={supplier.rating} size={18} />
        <strong className="font-display">
          {supplier.rating.toFixed(1)} / 5
        </strong>
        <small className="text-muted">{supplier.reviews} reviews</small>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm ms-auto"
          onClick={onRate}
        >
          <Sparkles /> Rate them
        </button>
      </div>

      <div className="gm-table-wrap mb-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Phone</td>
              <td>
                <a href={telHref(supplier.phone)}>{supplier.phone}</a>
              </td>
            </tr>
            <tr>
              <td>M-Pesa</td>
              <td>{supplier.till}</td>
            </tr>
            <tr>
              <td>Opening hours</td>
              <td>{supplier.hours}</td>
            </tr>
            <tr>
              <td>Minimum order</td>
              <td>{supplier.minOrder}</td>
            </tr>
            <tr>
              <td>Delivery</td>
              <td>
                {supplier.deliveryFee
                  ? `${money(supplier.deliveryFee)} · ${supplier.deliveryNote}`
                  : supplier.deliveryNote}
              </td>
            </tr>
            <tr>
              <td>Products</td>
              <td>{supplier.products.join(", ")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <a
          className="gm-btn gm-btn-lime gm-btn-sm"
          href={telHref(supplier.phone)}
        >
          <Phone /> Call {supplier.phone}
        </a>
        <a
          className="gm-btn gm-btn-soft gm-btn-sm"
          href={smsHref(
            supplier.phone,
            `Habari ${supplier.name}, hii ni ${FARM_CONTEXT.farmer} kutoka GrowMO. Ninaomba bei ya leo.`,
          )}
        >
          <MessageSquare /> SMS for prices
        </a>
        <a
          className="gm-btn gm-btn-outline gm-btn-sm"
          href={mapsHref(supplier.mapQuery)}
          target="_blank"
          rel="noreferrer"
        >
          <MapPin /> Directions
        </a>
      </div>

      <DashboardSectionHeader eyebrow="Shelf today" title="Stocked inputs" />
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Input</th>
              <th>Pack</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {supplier.offers.map((offer) => (
              <tr key={offer.itemId}>
                <td>
                  <strong>{offer.item}</strong>
                </td>
                <td>{offer.pack}</td>
                <td className="font-display">{money(offer.price)}</td>
                <td>{offer.stock}</td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-mpesa gm-btn-sm"
                    disabled={offer.stock < 1}
                    onClick={() => onOrder(offer)}
                  >
                    <ShoppingBag /> Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordDetail({ row }: { row: ApplicationRow }) {
  return (
    <div>
      <div className="d-flex flex-wrap gap-1 mb-3">
        <StatusChip label={row.method} tone="low" />
        <StatusChip label={CATEGORY_LABEL[row.category]} tone="neutral" />
        <span className="gm-chip">
          <CloudSun /> {row.weather} · {row.tempC}°C
        </span>
      </div>

      <div className="gm-table-wrap mb-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Date</td>
              <td>
                <strong>{row.date}</strong>
              </td>
            </tr>
            <tr>
              <td>Crop · plot</td>
              <td>
                {row.crop} · {row.plot}
              </td>
            </tr>
            <tr>
              <td>Input</td>
              <td>{row.inputName}</td>
            </tr>
            <tr>
              <td>Quantity used</td>
              <td className="font-display">
                {row.qty} {row.unit}
              </td>
            </tr>
            <tr>
              <td>Rate per acre</td>
              <td>{row.ratePerAcre}</td>
            </tr>
            <tr>
              <td>Applied by</td>
              <td>{row.appliedBy}</td>
            </tr>
            <tr>
              <td>Recorded cost</td>
              <td className="font-display">{money(row.cost)}</td>
            </tr>
            {row.phiDays ? (
              <tr>
                <td>Pre-harvest interval</td>
                <td>
                  {row.phiDays} days · safe from {row.safeUntil}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {row.phiDays ? (
        <div className="gm-plan-rec mb-3">
          <strong>Harvest safety</strong>
          <p className="mb-0 mt-1" style={{ fontSize: "0.88rem" }}>
            Do not harvest {row.crop} before {row.safeUntil}. Buyers testing for
            residues reject anything inside the PHI window.
          </p>
        </div>
      ) : null}

      <div className="gm-check-row">
        <ClipboardList />
        <span style={{ flex: 1 }}>
          <strong>Field note</strong>
          <small>{row.notes}</small>
        </span>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <Link className="gm-btn gm-btn-lime gm-btn-sm" to="/app/crops">
          <Sprout /> Open {row.crop} tracker
        </Link>
        <Link className="gm-btn gm-btn-outline gm-btn-sm" to="/app/planner">
          <Wheat /> Season planner
        </Link>
      </div>
    </div>
  );
}

function PriceHistoryPanel({
  item,
  alerts,
}: {
  item: CatalogItem;
  alerts: PriceAlert[];
}) {
  const months = PRICE_TRENDS.map((row) => row.month);
  const values = item.priceHistory;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const related = alerts.filter((alert) =>
    item.name.includes(alert.label.split(" ")[0]),
  );

  return (
    <div>
      <div className="d-flex flex-wrap gap-1 mb-3">
        <span className="gm-chip">
          <CalendarDays /> Jun 2026 – Nov 2026
        </span>
        <span className="gm-chip">
          <TrendingUp /> Low {money(min)}
        </span>
        <span className="gm-chip">
          <TrendingDown /> High {money(max)}
        </span>
      </div>

      <TrendChart
        formatValue={(value) => money(value)}
        points={months.map((month, index) => ({
          label: month,
          value: values[index] ?? item.priceMax,
        }))}
      />

      <DashboardSectionHeader eyebrow="Buying advice" title="When to buy" />
      <div className="gm-plan-rec mb-3">
        <strong>Buy {item.name} before 20 December</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.88rem" }}>
          Kiambu agro-vets raise prices 8–12% in the January planting rush. At{" "}
          {money(values[values.length - 1] ?? item.priceMax)} today you are
          already {money(max - (values[values.length - 1] ?? item.priceMax))}{" "}
          below the six-month high.
        </p>
      </div>

      <DashboardSectionHeader eyebrow="Your alerts" title="Price watches" />
      {related.length ? (
        related.map((alert) => (
          <div key={alert.id} className="gm-check-row">
            <BellRing />
            <span style={{ flex: 1 }}>
              <strong>
                {alert.label} {alert.direction} {money(alert.target)}
              </strong>
              <small>SMS to {alert.phone}</small>
            </span>
          </div>
        ))
      ) : (
        <div className="gm-check-row">
          <BellRing />
          <span style={{ flex: 1 }}>
            <strong>No alert on this input yet</strong>
            <small>
              Set one and GrowMO texts you the morning a Kiambu shelf price hits
              your target.
            </small>
          </span>
        </div>
      )}
    </div>
  );
}

function OrdersPanel({ orders }: { orders: OrderRecord[] }) {
  if (!orders.length)
    return (
      <div className="gm-empty">
        <HandCoins />
        <h3 className="font-display">No orders yet</h3>
        <p>
          When you pay for inputs with the simulated M-Pesa flow, the receipt
          and the stock it added appear here.
        </p>
      </div>
    );

  return (
    <div>
      {orders.map((order) => (
        <div key={order.id} className="gm-card p-3 mb-3">
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <div>
              <span className="gm-eyebrow">M-Pesa receipt</span>
              <h3 className="font-display mb-0">{order.receipt}</h3>
              <small className="text-muted">
                {order.at} · {order.phone}
              </small>
            </div>
            <div className="text-end">
              <strong className="font-display" style={{ fontSize: "1.2rem" }}>
                {money(order.total)}
              </strong>
              <small className="d-block text-muted">{order.supplier}</small>
            </div>
          </div>
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={`${order.id}-${line.itemId}`}>
                    <td>{line.name}</td>
                    <td className="font-display">
                      {line.qty} {line.unit}
                    </td>
                    <td className="font-display">{money(line.unitPrice)}</td>
                    <td className="font-display">
                      {money(line.qty * line.unitPrice)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Fulfilment</strong>
                  </td>
                  <td colSpan={3}>{order.fulfilment}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   MODALS — 1 · compare prices
   ========================================================================== */

function ComparePrices({
  item,
  onOrder,
  onClose,
}: {
  item: CatalogItem;
  onOrder: (line: OrderLine) => void;
  onClose: () => void;
}) {
  const [sort, setSort] = useState<"price" | "distance" | "verified">("price");
  const offers = useMemo(() => {
    const rows = offersFor(item.id);
    const sorted = [...rows];
    if (sort === "distance")
      sorted.sort((a, b) => a.supplier.distanceKm - b.supplier.distanceKm);
    if (sort === "verified")
      sorted.sort(
        (a, b) => Number(b.supplier.verified) - Number(a.supplier.verified),
      );
    return sorted;
  }, [item.id, sort]);

  if (!offers.length)
    return (
      <div className="gm-empty">
        <Store />
        <h3 className="font-display">No published price</h3>
        <p>
          None of the ten registered suppliers list {item.name}. Call the
          nearest agro-vet for today's price.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <a className="gm-btn gm-btn-lime" href={telHref("0722 115 480")}>
            <Phone /> Call Githunguri Agrovet
          </a>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="gm-seg">
          {(
            [
              { id: "price", label: "Cheapest" },
              { id: "distance", label: "Nearest" },
              { id: "verified", label: "Verified" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              className={sort === option.id ? "on" : ""}
              onClick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="gm-chip">
          <Boxes /> {offers.length} offer{offers.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Pack</th>
              <th>Price</th>
              <th>Distance</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offers.map(({ supplier, offer }) => (
              <tr key={`${supplier.id}-${offer.pack}`}>
                <td>
                  <strong>{supplier.name}</strong>
                  <br />
                  <small className="text-muted">
                    {supplier.town} · {supplier.till}
                  </small>
                </td>
                <td>{offer.pack}</td>
                <td className="font-display">
                  <strong>{money(offer.price)}</strong>
                  {supplier.verified ? (
                    <small className="d-block text-muted">verified</small>
                  ) : null}
                </td>
                <td>{supplier.distanceKm} km</td>
                <td>{offer.stock}</td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-mpesa gm-btn-sm"
                    disabled={offer.stock < 1}
                    onClick={() =>
                      onOrder({
                        itemId: offer.itemId,
                        name: offer.item,
                        qty: 1,
                        unit: offer.pack,
                        unitPrice: offer.price,
                        supplierId: supplier.id,
                      })
                    }
                  >
                    <ShoppingBag /> Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 2 · add / edit a purchase list line
   ========================================================================== */

function AddToListWizard({
  item,
  existing,
  suppliers,
  onSave,
  onClose,
}: {
  item: CatalogItem;
  existing: PurchaseSuggestion | null;
  suppliers: Supplier[];
  onSave: (line: PurchaseSuggestion) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState(String(existing?.qty ?? 1));
  const [supplierId, setSupplierId] = useState(
    existing?.supplierId ?? bestOffer(item.id)?.supplier.id ?? suppliers[0].id,
  );
  const [needBy, setNeedBy] = useState(existing?.needBy ?? "27 Nov 2026");
  const [priority, setPriority] = useState<PurchaseSuggestion["priority"]>(
    existing?.priority ?? "soon",
  );
  const [note, setNote] = useState(existing?.reason ?? "");

  const offer = offersFor(item.id).find(
    (row) => row.supplier.id === supplierId,
  );
  const unitPrice = offer?.offer.price ?? item.priceMax;
  const total = Number(qty || 0) * unitPrice;
  const supplier =
    suppliers.find((row) => row.id === supplierId) ?? suppliers[0];

  const save = () => {
    onSave({
      id: existing?.id ?? `buy-${Date.now()}`,
      itemId: item.id,
      name: `${item.name} (${item.pack})`,
      category: item.category,
      qty: Number(qty),
      unit: item.pack,
      needBy,
      daysOut:
        existing?.daysOut ??
        (priority === "urgent" ? 5 : priority === "soon" ? 12 : 30),
      estCost: total,
      supplierId,
      reason:
        note ||
        `Added manually · ${supplier.name} quoted ${money(unitPrice)} per ${item.pack}`,
      priority,
      bulkSaving:
        Number(qty) >= 5 ? Math.round(unitPrice * 0.08) * Number(qty) : 0,
      bulkNote:
        Number(qty) >= 5
          ? `Bulk discount assumed on ${qty} units`
          : "Single-unit price",
    });
  };

  return (
    <div>
      <Stepper
        steps={["Input & quantity", "Supplier & deadline"]}
        current={step}
        onStep={setStep}
      />

      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Input" full>
            <input
              className="gm-input"
              value={`${item.name} · ${item.spec}`}
              readOnly
            />
          </Field>
          <Field label={`Quantity (${item.pack})`}>
            <input
              className="gm-input"
              inputMode="numeric"
              value={qty}
              onChange={(event) =>
                setQty(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
          </Field>
          <Field label="Recommended rate">
            <input className="gm-input" value={item.rate} readOnly />
          </Field>
          <div className="full gm-plan-rec">
            <strong>Storage note</strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              {item.storage} · {item.caution}
            </p>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Supplier" full>
            <select
              className="gm-select"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
            >
              {suppliers.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.distanceKm} km ·{" "}
                  {offersFor(item.id).find((o) => o.supplier.id === row.id)
                    ? money(
                        offersFor(item.id).find((o) => o.supplier.id === row.id)
                          ?.offer.price ?? item.priceMax,
                      )
                    : "quote on request"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Needed by">
            <input
              className="gm-input"
              value={needBy}
              onChange={(event) => setNeedBy(event.target.value)}
            />
          </Field>
          <Field label="Priority">
            <select
              className="gm-select"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as PurchaseSuggestion["priority"],
                )
              }
            >
              <option value="urgent">Urgent — this week</option>
              <option value="soon">Soon — next two weeks</option>
              <option value="planned">Planned — later this season</option>
            </select>
          </Field>
          <Field label="Why you need it" full>
            <input
              className="gm-input"
              value={note}
              placeholder="Cabbage top dressing before the heading stage"
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <div className="full gm-plan-total">
            <div>
              <small>
                {qty} × {item.pack} from {supplier.name}
              </small>
              <strong className="font-display">{money(total)}</strong>
            </div>
            <span>{supplier.phone}</span>
          </div>
        </div>
      ) : null}

      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep((value) => value - 1)}
        onNext={save}
        nextDisabled={!Number(qty)}
        finishLabel={existing ? "Save changes" : "Add to purchase list"}
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 3 · M-Pesa order wizard
   ========================================================================== */

const FULFILMENT_OPTIONS = [
  { id: "Pickup at the agro-vet", fee: 0, note: "Collect yourself, no charge" },
  { id: "Boda delivery", fee: 350, note: "Within 5 km, same afternoon" },
  { id: "Canter delivery", fee: 800, note: "Bulk loads, book 3 days ahead" },
];

function OrderWizard({
  lines,
  suppliers,
  onComplete,
  onClose,
}: {
  lines: OrderLine[];
  suppliers: Supplier[];
  onComplete: (order: OrderRecord) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(lines.map((line) => [line.itemId, line.qty])),
  );
  const [fulfilment, setFulfilment] = useState(FULFILMENT_OPTIONS[0].id);
  const [phone, setPhone] = useState("0712 345 678");
  const [otp, setOtp] = useState("");
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<OrderRecord | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const fee = FULFILMENT_OPTIONS.find((row) => row.id === fulfilment)?.fee ?? 0;
  const subtotal = lines.reduce(
    (sum, line) => sum + (quantities[line.itemId] ?? line.qty) * line.unitPrice,
    0,
  );
  const total = subtotal + fee;
  const supplierNames = [
    ...new Set(
      lines.map(
        (line) =>
          suppliers.find((row) => row.id === line.supplierId)?.name ??
          "Supplier",
      ),
    ),
  ].join(" + ");

  const pay = () => {
    setBusy(true);
    setStep(4);
    window.setTimeout(() => {
      const order: OrderRecord = {
        id: `ord-${Date.now()}`,
        at: `${FARM_CONTEXT.today} · 14:20`,
        supplier: supplierNames,
        fulfilment,
        phone,
        receipt: receiptCode(),
        lines: lines.map((line) => ({
          ...line,
          qty: quantities[line.itemId] ?? line.qty,
        })),
        total,
      };
      setBusy(false);
      setDone(order);
      onComplete(order);
    }, 1400);
  };

  if (done)
    return (
      <div className="gm-plan-payment-receipt text-center">
        <CheckCircle2 width={52} height={52} />
        <span className="gm-eyebrow d-block mt-2">
          M-Pesa receipt · {done.receipt}
        </span>
        <h3 className="font-display mt-2">Input order confirmed</h3>
        <p className="mb-2">
          {done.lines.length} line{done.lines.length === 1 ? "" : "s"} reserved
          from {done.supplier}. Stock has been added to your store.
        </p>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              {done.lines.map((line) => (
                <tr key={line.itemId}>
                  <td>
                    {line.name} · {line.qty} {line.unit}
                  </td>
                  <td className="font-display">
                    {money(line.qty * line.unitPrice)}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Fulfilment</td>
                <td>{done.fulfilment}</td>
              </tr>
              <tr>
                <td>Paid from</td>
                <td>
                  <strong>{done.phone}</strong>
                </td>
              </tr>
              <tr>
                <td>Total</td>
                <td className="font-display">
                  <strong>{money(done.total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime mt-3"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    );

  return (
    <div>
      <Stepper
        steps={["Basket", "Fulfilment", "Confirm", "Wallet PIN", "Receipt"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />

      {step === 0 ? (
        <div className="mt-3">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Input</th>
                  <th>Unit price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.itemId}>
                    <td>
                      <strong>{line.name}</strong>
                      <br />
                      <small className="text-muted">{line.unit}</small>
                    </td>
                    <td className="font-display">{money(line.unitPrice)}</td>
                    <td>
                      <input
                        className="gm-input"
                        style={{ maxWidth: 96 }}
                        inputMode="numeric"
                        aria-label={`Quantity for ${line.name}`}
                        value={quantities[line.itemId] ?? line.qty}
                        onChange={(event) =>
                          setQuantities((current) => ({
                            ...current,
                            [line.itemId]: Number(
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4) || 0,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="font-display">
                      {money(
                        (quantities[line.itemId] ?? line.qty) * line.unitPrice,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.84rem" }}>
            Quantities above your reorder level unlock bulk pricing at the Yara
            pallet rate.
          </p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-3">
          {FULFILMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`gm-checkcard ${fulfilment === option.id ? "on" : ""}`}
              onClick={() => setFulfilment(option.id)}
            >
              <input
                type="radio"
                name="fulfilment"
                checked={fulfilment === option.id}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>
                  {option.id}
                  {option.fee ? ` · ${money(option.fee)}` : " · free"}
                </strong>
                <small>{option.note}</small>
              </span>
            </button>
          ))}
          <div className="gm-form-grid mt-3">
            <Field label="M-Pesa phone number" full>
              <input
                className="gm-input"
                value={phone}
                aria-label="M-Pesa phone number"
                onChange={(event) =>
                  setPhone(
                    event.target.value.replace(/[^\d ]/g, "").slice(0, 12),
                  )
                }
              />
            </Field>
            <div className="full gm-plan-total">
              <div>
                <small>
                  Subtotal {money(subtotal)} · delivery {money(fee)}
                </small>
                <strong className="font-display">{money(total)}</strong>
              </div>
              <span>{supplierNames}</span>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-3">
          <div className="gm-plan-rec">
            <strong>Simulated phone confirmation</strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              Enter local simulation code <strong>517204</strong> for {phone}.
              No real SMS is sent in this demo.
            </p>
          </div>
          <div className="mt-3">
            <OtpInput
              value={otp}
              onChange={setOtp}
              label="6-digit order code"
            />
          </div>
          <button
            type="button"
            className={`gm-checkcard mt-3 ${approved ? "on" : ""}`}
            onClick={() => setApproved((value) => !value)}
          >
            <input type="checkbox" checked={approved} readOnly tabIndex={-1} />
            <span>
              <strong>Approve {money(total)} for these farm inputs</strong>
              <small>
                {lines.length} line{lines.length === 1 ? "" : "s"} ·{" "}
                {fulfilment}
              </small>
            </span>
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="text-center mt-3">
          <h3 className="font-display">Enter your GrowMO wallet PIN</h3>
          <p style={{ fontSize: "0.88rem" }}>
            The simulated M-Pesa payment is recorded against the{" "}
            {FARM_CONTEXT.season} input budget.
          </p>
          <PinPad
            resetKey={resetKey}
            onComplete={(pin) => {
              if (new Set(pin).size === 1) {
                setResetKey((value) => value + 1);
                return;
              }
              pay();
            }}
            actionLabel="Use any non-repeating 4 digits in this simulation"
          />
        </div>
      ) : null}

      {step === 4 && busy ? (
        <div className="text-center p-4">
          <span className="gm-spinner" />
          <h3 className="font-display mt-3">Confirming M-Pesa payment…</h3>
          <p style={{ fontSize: "0.88rem" }}>
            Waiting for the simulated wallet and supplier response.
          </p>
        </div>
      ) : null}

      {step < 3 ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => setStep((value) => value + 1)}
          finishLabel="Continue to wallet PIN"
          nextDisabled={
            lines.some((line) => !Number(quantities[line.itemId])) ||
            phone.replace(/\D/g, "").length !== 10 ||
            (step === 2 && (otp !== "517204" || !approved))
          }
        />
      ) : null}
    </div>
  );
}

/* ==========================================================================
   MODALS — 4 · adjust stock
   ========================================================================== */

function AdjustStockWizard({
  row,
  onSave,
  onClose,
}: {
  row: StockRow;
  onSave: (delta: number, kind: MovementKind, reason: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [counted, setCounted] = useState(String(row.onHand));
  const [reason, setReason] = useState("Stocktake correction");
  const delta = Math.round((Number(counted || 0) - row.onHand) * 100) / 100;

  return (
    <div>
      <Stepper steps={["Count", "Reason"]} current={step} onStep={setStep} />

      {step === 0 ? (
        <div className="mt-3">
          <StockMeter
            onHand={row.onHand}
            reorder={row.reorder}
            unit={row.unit}
          />
          <div className="gm-form-grid mt-3">
            <Field label={`Counted on hand (${row.unit})`}>
              <input
                className="gm-input"
                inputMode="decimal"
                value={counted}
                onChange={(event) =>
                  setCounted(
                    event.target.value.replace(/[^\d.]/g, "").slice(0, 8),
                  )
                }
              />
            </Field>
            <Field label="Variance">
              <input
                className="gm-input font-display"
                value={`${delta > 0 ? "+" : ""}${delta} ${row.unit}`}
                readOnly
              />
            </Field>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {[-1, -0.5, 0.5, 1].map((bump) => (
              <button
                key={bump}
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() =>
                  setCounted(
                    String(
                      Math.max(
                        0,
                        Math.round((Number(counted || 0) + bump) * 100) / 100,
                      ),
                    ),
                  )
                }
              >
                {bump > 0 ? `+${bump}` : bump} {row.unit}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Reason" full>
            <select
              className="gm-select"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option>Stocktake correction</option>
              <option>Spillage or damaged bag</option>
              <option>Returned to supplier</option>
              <option>Expired / written off</option>
              <option>Given to a neighbour</option>
              <option>Opening balance entry</option>
            </select>
          </Field>
          <div className="full gm-plan-rec">
            <strong>
              {delta === 0
                ? "No change"
                : `${delta > 0 ? "Increase" : "Decrease"} of ${Math.abs(delta)} ${row.unit}`}
            </strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              {row.name} will show{" "}
              {Math.max(0, Math.round((row.onHand + delta) * 100) / 100)}{" "}
              {row.unit} after posting. The movement is written to the audit
              trail.
            </p>
          </div>
        </div>
      ) : null}

      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => onSave(delta, delta < 0 ? "adjusted" : "in", reason)}
        nextDisabled={delta === 0}
        finishLabel="Post adjustment"
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 5 · record an application
   ========================================================================== */

const FARM_CROPS = [
  {
    id: "crop-cabbage",
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · Shamba ya nyumba",
  },
  { id: "crop-maize", crop: "Maize H6213", plot: "Plot 2 · Shamba ya chini" },
  { id: "crop-beans", crop: "Dry Beans Rosecoco", plot: "Plot 3 · Kwa mto" },
  { id: "crop-tomato", crop: "Tomato Anna F1", plot: "Greenhouse 1" },
  { id: "crop-potato", crop: "Potato Shangi", plot: "Githiga lease" },
  { id: "crop-kale", crop: "Kale Collard Mfalme", plot: "Kitchen garden" },
];

const WORKERS = ["Mary Wanjiku", "John Mwangi", "Grace Achieng", "Peter Kamau"];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function addDays(dateText: string, days: number) {
  const parts = dateText.split(" ");
  if (parts.length !== 3) return dateText;
  const day = Number(parts[0]);
  const monthIndex = MONTHS.indexOf(parts[1]);
  const year = Number(parts[2]);
  if (!day || monthIndex < 0 || !year) return dateText;
  const date = new Date(Date.UTC(year, monthIndex, day + days));
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function phiDaysOf(item: CatalogItem | null) {
  if (!item?.phi) return null;
  const match = item.phi.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function ApplicationWizard({
  stock,
  defaultStockId,
  onSave,
  onClose,
}: {
  stock: StockRow[];
  defaultStockId: string;
  onSave: (record: ApplicationRow, stockId: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [cropId, setCropId] = useState("crop-cabbage");
  const [stockId, setStockId] = useState(defaultStockId || stock[0]?.id || "");
  const [method, setMethod] = useState(APPLICATION_METHODS[0]);
  const [rate, setRate] = useState("50 kg/acre");
  const [qty, setQty] = useState("25");
  const [weather, setWeather] = useState(APPLICATION_WEATHER[0]);
  const [temp, setTemp] = useState("23");
  const [worker, setWorker] = useState(WORKERS[0]);
  const [notes, setNotes] = useState("");

  const row = stock.find((item) => item.id === stockId) ?? stock[0];
  const item = row
    ? INPUT_CATALOG.find((entry) => entry.id === row.itemId)
    : null;
  const crop = FARM_CROPS.find((entry) => entry.id === cropId) ?? FARM_CROPS[0];
  const phi = phiDaysOf(item ?? null);
  const quantity = Number(qty || 0);
  const short = row ? quantity > row.onHand : true;

  const finish = () => {
    if (!row) return;
    onSave(
      {
        id: `app-${Date.now()}`,
        date: FARM_CONTEXT.today,
        cropId: crop.id,
        crop: crop.crop,
        plot: crop.plot,
        inputName: row.name,
        category: row.category,
        qty: quantity,
        unit: row.unit,
        ratePerAcre: rate,
        method,
        appliedBy: worker,
        weather,
        tempC: Number(temp || 0),
        phiDays: phi,
        safeUntil: phi ? addDays(FARM_CONTEXT.today, phi) : null,
        cost: Math.round(quantity * row.unitCost),
        notes: notes || `${method} on ${crop.crop}, recorded from the store`,
      },
      row.id,
    );
  };

  return (
    <div>
      <Stepper
        steps={["Crop", "Input & method", "Quantity", "Confirm"]}
        current={step}
        onStep={setStep}
      />

      {step === 0 ? (
        <div className="mt-3">
          {FARM_CROPS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`gm-checkcard ${cropId === entry.id ? "on" : ""}`}
              onClick={() => setCropId(entry.id)}
            >
              <input
                type="radio"
                name="app-crop"
                checked={cropId === entry.id}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{entry.crop}</strong>
                <small>{entry.plot}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Input from the store" full>
            <select
              className="gm-select"
              value={stockId}
              onChange={(event) => setStockId(event.target.value)}
            >
              {stock.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} · {entry.onHand} {entry.unit} on hand
                </option>
              ))}
            </select>
          </Field>
          <Field label="Application method">
            <select
              className="gm-select"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {APPLICATION_METHODS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Rate per acre">
            <input
              className="gm-input"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </Field>
          {item ? (
            <div className="full gm-plan-rec">
              <strong>{item.name} · recommended rate</strong>
              <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
                {item.rate} · {item.caution}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="gm-form-grid mt-3">
          <Field label={`Quantity used (${row?.unit ?? ""})`}>
            <input
              className="gm-input"
              inputMode="decimal"
              value={qty}
              onChange={(event) =>
                setQty(event.target.value.replace(/[^\d.]/g, "").slice(0, 8))
              }
            />
          </Field>
          <Field label="On hand after">
            <input
              className="gm-input font-display"
              value={
                row
                  ? `${Math.max(0, Math.round((row.onHand - quantity) * 100) / 100)} ${row.unit}`
                  : "—"
              }
              readOnly
            />
          </Field>
          <Field label="Weather">
            <select
              className="gm-select"
              value={weather}
              onChange={(event) => setWeather(event.target.value)}
            >
              {APPLICATION_WEATHER.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Temperature (°C)">
            <input
              className="gm-input"
              inputMode="numeric"
              value={temp}
              onChange={(event) =>
                setTemp(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
            />
          </Field>
          <Field label="Applied by" full>
            <select
              className="gm-select"
              value={worker}
              onChange={(event) => setWorker(event.target.value)}
            >
              {WORKERS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label="Field note" full>
            <input
              className="gm-input"
              value={notes}
              placeholder="Evening spray, no rain expected for 6 hours"
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
          {short ? (
            <p className="gm-ferr full">
              That is more than the {row?.onHand ?? 0} {row?.unit ?? ""} in the
              store. Adjust the quantity or record the purchase first.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 3 && row ? (
        <div className="mt-3">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Date</td>
                  <td>
                    <strong>{FARM_CONTEXT.today}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Crop</td>
                  <td>
                    {crop.crop} · {crop.plot}
                  </td>
                </tr>
                <tr>
                  <td>Input</td>
                  <td>
                    {row.name} · {quantity} {row.unit} ({method})
                  </td>
                </tr>
                <tr>
                  <td>Worker · weather</td>
                  <td>
                    {worker} · {weather}, {temp}°C
                  </td>
                </tr>
                <tr>
                  <td>Cost recorded</td>
                  <td className="font-display">
                    {money(quantity * row.unitCost)}
                  </td>
                </tr>
                <tr>
                  <td>Harvest safety</td>
                  <td>
                    {phi
                      ? `PHI ${phi} days · safe from ${addDays(FARM_CONTEXT.today, phi)}`
                      : "No pre-harvest interval"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="gm-plan-rec mt-3">
            <strong>Stock will be deducted</strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              {row.name} drops from {row.onHand} to{" "}
              {Math.max(0, Math.round((row.onHand - quantity) * 100) / 100)}{" "}
              {row.unit} and the movement is written to the audit trail.
            </p>
          </div>
        </div>
      ) : null}

      <WizardActions
        step={step}
        last={3}
        onBack={() => setStep((value) => value - 1)}
        onNext={finish}
        nextDisabled={!quantity || short}
        finishLabel="Save application"
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 6 · transfer stock
   ========================================================================== */

function TransferWizard({
  row,
  stores,
  onSave,
  onClose,
}: {
  row: StockRow;
  stores: StoreLocation[];
  onSave: (storeId: string, note: string) => void;
  onClose: () => void;
}) {
  const [storeId, setStoreId] = useState(row.storeId);
  const [note, setNote] = useState("");

  return (
    <div>
      <p className="mb-2" style={{ fontSize: "0.88rem" }}>
        Moving{" "}
        <strong>
          {row.onHand} {row.unit}
        </strong>{" "}
        of {row.name}. The audit trail keeps both the source and the
        destination.
      </p>
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          className={`gm-checkcard ${storeId === store.id ? "on" : ""}`}
          disabled={store.id === row.storeId}
          onClick={() => setStoreId(store.id)}
        >
          <input
            type="radio"
            name="transfer-store"
            checked={storeId === store.id}
            readOnly
            tabIndex={-1}
          />
          <span>
            <strong>
              {store.name}
              {store.id === row.storeId ? " · current" : ""}
            </strong>
            <small>
              {store.condition} · {store.usedPct}% full
            </small>
          </span>
        </button>
      ))}
      <div className="gm-field mt-3">
        <label className="gm-f-label" htmlFor="transfer-note">
          Reason for the move
        </label>
        <input
          id="transfer-note"
          className="gm-input"
          value={note}
          placeholder="Needed at the greenhouse for the morning spray"
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <WizardActions
        step={0}
        last={0}
        onBack={onClose}
        onNext={() => onSave(storeId, note)}
        nextDisabled={storeId === row.storeId}
        finishLabel="Move stock"
      />
    </div>
  );
}

/* ==========================================================================
   MODALS — 7 · stocktake
   ========================================================================== */

function StocktakeWizard({
  stock,
  onPost,
  onClose,
}: {
  stock: StockRow[];
  onPost: (entries: { id: string; counted: number }[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries(stock.map((row) => [row.id, String(row.onHand)])),
  );
  const [counter, setCounter] = useState(WORKERS[0]);

  const entries = stock.map((row) => ({
    id: row.id,
    row,
    counted: Number(counts[row.id] || 0),
  }));
  const variances = entries.filter(
    (entry) => Math.round((entry.counted - entry.row.onHand) * 100) !== 0,
  );
  const valueChange = variances.reduce(
    (sum, entry) =>
      sum + (entry.counted - entry.row.onHand) * entry.row.unitCost,
    0,
  );

  return (
    <div>
      <Stepper
        steps={["Count sheet", "Variances", "Post"]}
        current={step}
        onStep={setStep}
      />

      {step === 0 ? (
        <div className="mt-3">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Input</th>
                  <th>Book</th>
                  <th>Counted</th>
                  <th>Storage</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.row.name}</strong>
                      <br />
                      <small className="text-muted">{entry.row.unit}</small>
                    </td>
                    <td className="font-display">
                      {entry.row.onHand} {entry.row.unit}
                    </td>
                    <td>
                      <input
                        className="gm-input"
                        style={{ maxWidth: 110 }}
                        inputMode="decimal"
                        aria-label={`Counted ${entry.row.name}`}
                        value={counts[entry.id] ?? "0"}
                        onChange={(event) =>
                          setCounts((current) => ({
                            ...current,
                            [entry.id]: event.target.value
                              .replace(/[^\d.]/g, "")
                              .slice(0, 8),
                          }))
                        }
                      />
                    </td>
                    <td>
                      {
                        STORES.find((store) => store.id === entry.row.storeId)
                          ?.name
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gm-field mt-3">
            <label className="gm-f-label" htmlFor="stocktake-counter">
              Counted by
            </label>
            <select
              id="stocktake-counter"
              className="gm-select"
              value={counter}
              onChange={(event) => setCounter(event.target.value)}
            >
              {WORKERS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-3">
          {variances.length ? (
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Input</th>
                    <th>Book</th>
                    <th>Counted</th>
                    <th>Variance</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {variances.map((entry) => {
                    const delta =
                      Math.round((entry.counted - entry.row.onHand) * 100) /
                      100;
                    return (
                      <tr key={entry.id}>
                        <td>
                          <strong>{entry.row.name}</strong>
                        </td>
                        <td className="font-display">
                          {entry.row.onHand} {entry.row.unit}
                        </td>
                        <td className="font-display">
                          {entry.counted} {entry.row.unit}
                        </td>
                        <td>
                          <StatusChip
                            label={`${delta > 0 ? "+" : ""}${delta} ${entry.row.unit}`}
                            tone={delta > 0 ? "low" : "high"}
                          />
                        </td>
                        <td className="font-display">
                          {money(delta * entry.row.unitCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="gm-empty">
              <CheckCircle2 />
              <h3 className="font-display">Shelves match the books</h3>
              <p>
                Every counted quantity equals the recorded balance. Posting will
                simply stamp today's stocktake on the audit trail.
              </p>
            </div>
          )}
          <div className="gm-plan-rec mt-3">
            <strong>
              Stock value moves by {money(valueChange)} · counted by {counter}
            </strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              {variances.length} line{variances.length === 1 ? "" : "s"} will be
              adjusted and written to the movement log.
            </p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="text-center p-3">
          <PackageCheck width={48} height={48} />
          <h3 className="font-display mt-2">Post the stocktake?</h3>
          <p style={{ fontSize: "0.88rem" }}>
            This closes the count for {FARM_CONTEXT.today}. Adjustments cannot
            be undone, but every change stays in the audit trail.
          </p>
        </div>
      ) : null}

      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          onPost(
            entries.map((entry) => ({ id: entry.id, counted: entry.counted })),
          )
        }
        finishLabel="Post stocktake"
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 8 · add a stock line
   ========================================================================== */

function NewItemWizard({
  stores,
  onSave,
  onClose,
}: {
  stores: StoreLocation[];
  onSave: (row: StockRow) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [itemId, setItemId] = useState("cat-mancozeb");
  const [qty, setQty] = useState("1");
  const [cost, setCost] = useState("1450");
  const [reorder, setReorder] = useState("1");
  const [storeId, setStoreId] = useState("store-main");
  const [allocatedTo, setAllocatedTo] = useState("Unallocated");
  const [batch, setBatch] = useState("");

  const matches = INPUT_CATALOG.filter((item) =>
    `${item.name} ${item.spec} ${item.company}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  ).slice(0, 6);
  const chosen = INPUT_CATALOG.find((item) => item.id === itemId);

  return (
    <div>
      <Stepper
        steps={["Product", "Quantities", "Storage"]}
        current={step}
        onStep={setStep}
      />

      {step === 0 ? (
        <div className="mt-3">
          <div className="gm-field">
            <label className="gm-f-label" htmlFor="new-item-search">
              Search the catalog
            </label>
            <div className="gm-search-field">
              <Search />
              <input
                id="new-item-search"
                className="gm-input"
                value={query}
                placeholder="Mancozeb, DAP, Gloria F1…"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          {matches.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`gm-checkcard ${itemId === item.id ? "on" : ""}`}
              onClick={() => {
                setItemId(item.id);
                setCost(String(item.priceMax));
              }}
            >
              <input
                type="radio"
                name="new-item"
                checked={itemId === item.id}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>
                  {item.name} · {item.pack}
                </strong>
                <small>
                  {item.spec} · {money(item.priceMax)} market price
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Quantity on hand">
            <input
              className="gm-input"
              inputMode="decimal"
              value={qty}
              onChange={(event) =>
                setQty(event.target.value.replace(/[^\d.]/g, "").slice(0, 8))
              }
            />
          </Field>
          <Field label="Unit cost (KES)">
            <input
              className="gm-input"
              inputMode="numeric"
              value={cost}
              onChange={(event) =>
                setCost(event.target.value.replace(/\D/g, "").slice(0, 7))
              }
            />
          </Field>
          <Field label="Reorder level">
            <input
              className="gm-input"
              inputMode="decimal"
              value={reorder}
              onChange={(event) =>
                setReorder(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 6),
                )
              }
            />
          </Field>
          <Field label="Allocated to">
            <input
              className="gm-input"
              value={allocatedTo}
              placeholder="Cabbage · basal (Plot 1)"
              onChange={(event) => setAllocatedTo(event.target.value)}
            />
          </Field>
          <div className="full gm-plan-total">
            <div>
              <small>Stock value added</small>
              <strong className="font-display">
                {money(Number(qty || 0) * Number(cost || 0))}
              </strong>
            </div>
            <span>{chosen?.pack ?? ""}</span>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-3">
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              className={`gm-checkcard ${storeId === store.id ? "on" : ""}`}
              onClick={() => setStoreId(store.id)}
            >
              <input
                type="radio"
                name="new-store"
                checked={storeId === store.id}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{store.name}</strong>
                <small>
                  {store.condition} · {store.usedPct}% full
                </small>
              </span>
            </button>
          ))}
          <div className="gm-field mt-3">
            <label className="gm-f-label" htmlFor="new-batch">
              Batch number (optional)
            </label>
            <input
              id="new-batch"
              className="gm-input"
              value={batch}
              placeholder="MZ-1188"
              onChange={(event) => setBatch(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          onSave({
            id: `stk-${Date.now()}`,
            itemId,
            name: chosen?.name ?? "Custom input",
            category: chosen?.category ?? "equipment",
            onHand: Number(qty || 0),
            unit: chosen?.pack ?? "unit",
            reorder: Number(reorder || 0),
            allocatedTo: allocatedTo || "Unallocated",
            storeId,
            batch: batch || "—",
            expiry: null,
            unitCost: Number(cost || 0),
            lastUpdated: FARM_CONTEXT.today,
          })
        }
        nextDisabled={!Number(qty)}
        finishLabel="Add to inventory"
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 9 · delete application record (destructive)
   ========================================================================== */

function DeleteRecordConfirm({
  row,
  onCancel,
  onDelete,
}: {
  row: ApplicationRow;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <div className="gm-table-wrap mb-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Date</td>
              <td>{row.date}</td>
            </tr>
            <tr>
              <td>Input</td>
              <td>
                {row.inputName} · {row.qty} {row.unit}
              </td>
            </tr>
            <tr>
              <td>Crop</td>
              <td>
                {row.crop} · {row.appliedBy}
              </td>
            </tr>
            <tr>
              <td>Cost recorded</td>
              <td className="font-display">{money(row.cost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className={`gm-checkcard ${confirmed ? "on" : ""}`}
        onClick={() => setConfirmed((value) => !value)}
      >
        <input type="checkbox" checked={confirmed} readOnly tabIndex={-1} />
        <span>
          <strong>I understand this removes a traceability record</strong>
          <small>
            Buyers and certifiers audit this log. Stock is not restored.
          </small>
        </span>
      </button>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Keep record
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          disabled={!confirmed}
          onClick={onDelete}
        >
          <Trash2 /> Delete record
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 10 · edit application record
   ========================================================================== */

function EditRecordForm({
  row,
  onSave,
  onClose,
}: {
  row: ApplicationRow;
  onSave: (updated: ApplicationRow) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(row.date);
  const [qty, setQty] = useState(String(row.qty));
  const [method, setMethod] = useState(row.method);
  const [worker, setWorker] = useState(row.appliedBy);
  const [weather, setWeather] = useState(row.weather);
  const [notes, setNotes] = useState(row.notes);

  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Date">
          <input
            className="gm-input"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label={`Quantity (${row.unit})`}>
          <input
            className="gm-input"
            inputMode="decimal"
            value={qty}
            onChange={(event) =>
              setQty(event.target.value.replace(/[^\d.]/g, "").slice(0, 8))
            }
          />
        </Field>
        <Field label="Method">
          <select
            className="gm-select"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            {APPLICATION_METHODS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Applied by">
          <select
            className="gm-select"
            value={worker}
            onChange={(event) => setWorker(event.target.value)}
          >
            {WORKERS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Weather">
          <select
            className="gm-select"
            value={weather}
            onChange={(event) => setWeather(event.target.value)}
          >
            {APPLICATION_WEATHER.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Field note" full>
          <input
            className="gm-input"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>
      </div>
      <WizardActions
        step={0}
        last={0}
        onBack={onClose}
        onNext={() =>
          onSave({
            ...row,
            date,
            qty: Number(qty || 0),
            method,
            appliedBy: worker,
            weather,
            notes,
            cost: Math.round((Number(qty || 0) * row.cost) / (row.qty || 1)),
          })
        }
        nextDisabled={!Number(qty)}
        finishLabel="Save changes"
      />
    </div>
  );
}

/* ==========================================================================
   MODALS — 11 · duplicate an application
   ========================================================================== */

function DuplicateRecordConfirm({
  row,
  onCancel,
  onSave,
}: {
  row: ApplicationRow;
  onCancel: () => void;
  onSave: (date: string, assignee: string) => void;
}) {
  const [date, setDate] = useState(addDays(FARM_CONTEXT.today, 1));
  const [assignee, setAssignee] = useState(row.appliedBy);

  return (
    <div>
      <div className="gm-plan-rec mb-3">
        <strong>
          {row.inputName} · {row.qty} {row.unit} on {row.crop}
        </strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          {row.method} at {row.ratePerAcre} — the same round will be logged on
          the date below and deducted from stock again.
        </p>
      </div>
      <div className="gm-form-grid">
        <Field label="New date">
          <input
            className="gm-input"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label="Applied by">
          <select
            className="gm-select"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
          >
            {WORKERS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onSave(date, assignee)}
        >
          <Repeat /> Log repeat application
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 12 · rate a supplier
   ========================================================================== */

function RateSupplierForm({
  supplier,
  onSave,
  onClose,
}: {
  supplier: Supplier;
  onSave: (rating: number, comment: string) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(Math.round(supplier.rating));
  const [comment, setComment] = useState("");

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="gm-rate">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={value <= rating ? "on" : ""}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setRating(value)}
            >
              <Star fill="currentColor" aria-hidden="true" />
            </button>
          ))}
        </span>
        <strong className="font-display">{rating}.0 / 5</strong>
      </div>
      <div className="gm-field">
        <label className="gm-f-label" htmlFor="rate-comment">
          What should other farmers know?
        </label>
        <textarea
          id="rate-comment"
          className="gm-input"
          style={{ minHeight: 110 }}
          value={comment}
          placeholder="Fair prices, opens early, delivers the same afternoon…"
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
      <div className="gm-plan-rec mb-3">
        <strong>Your rating joins {supplier.reviews} others</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          Ratings are anonymous and only shown to farmers within 30 km.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onSave(rating, comment)}
        >
          <Check /> Submit rating
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 13 · alert settings
   ========================================================================== */

function AlertSettingsForm({
  settings,
  onSave,
  onClose,
}: {
  settings: AlertSettings;
  onSave: (next: AlertSettings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<AlertSettings>(settings);

  return (
    <div>
      <div className="gm-form-grid cols3">
        <Field label="Reorder warning at (%)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={draft.reorderAtPercent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                reorderAtPercent: Number(
                  event.target.value.replace(/\D/g, "").slice(0, 3) || 0,
                ),
              }))
            }
          />
        </Field>
        <Field label="Expiry warning (days)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={draft.expiryWarningDays}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                expiryWarningDays: Number(
                  event.target.value.replace(/\D/g, "").slice(0, 3) || 0,
                ),
              }))
            }
          />
        </Field>
        <Field label="Price move (%)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={draft.priceDropPercent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                priceDropPercent: Number(
                  event.target.value.replace(/\D/g, "").slice(0, 2) || 0,
                ),
              }))
            }
          />
        </Field>
      </div>

      <Toggle
        checked={draft.smsAlerts}
        onChange={(value) =>
          setDraft((current) => ({ ...current, smsAlerts: value }))
        }
        label="SMS alerts"
        desc={`Sent to ${FARM_CONTEXT.phone}`}
      />
      <Toggle
        checked={draft.whatsappAlerts}
        onChange={(value) =>
          setDraft((current) => ({ ...current, whatsappAlerts: value }))
        }
        label="WhatsApp alerts"
        desc="GrowMO agri channel · includes supplier offers"
      />
      <Toggle
        checked={draft.autoPurchaseList}
        onChange={(value) =>
          setDraft((current) => ({ ...current, autoPurchaseList: value }))
        }
        label="Refresh the purchase list daily"
        desc="Rebuilt at 05:00 from the crop schedule"
      />

      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onSave(draft)}
        >
          <Check /> Save thresholds
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 14 · supplier stock check
   ========================================================================== */

function SyncModal({
  suppliers,
  onClose,
}: {
  suppliers: Supplier[];
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(true);
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => {
      setChecked((value) => value + 1);
      if (checked + 1 >= suppliers.length) setBusy(false);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [busy, checked, suppliers.length]);

  return (
    <div>
      {busy ? (
        <div className="text-center p-4">
          <span className="gm-spinner" />
          <h3 className="font-display mt-3">
            Checking {checked + 1} of {suppliers.length} suppliers…
          </h3>
          <p style={{ fontSize: "0.88rem" }}>
            GrowMO pings each agro-vet's till and stock sheet over USSD.
          </p>
          <div className="gm-wsteps mt-3">
            {suppliers.map((supplier, index) => (
              <span
                key={supplier.id}
                className={index <= checked ? "on" : ""}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="gm-plan-rec mb-3">
            <strong>
              {suppliers.length} suppliers checked · 3 prices moved
            </strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              CAN dropped to KES 5,000 at Githunguri Farmers Agrovet; Ridomil is
              short at Kiambu until Friday.
            </p>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Response</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={supplier.id}>
                    <td>
                      <strong>{supplier.name}</strong>
                      <br />
                      <small className="text-muted">{supplier.town}</small>
                    </td>
                    <td>
                      <StatusChip
                        label={index % 4 === 0 ? "Prices updated" : "No change"}
                        tone={index % 4 === 0 ? "medium" : "low"}
                      />
                    </td>
                    <td>
                      {index % 4 === 0
                        ? `${supplier.offers[0]?.item ?? "Shelf"} ${money(supplier.offers[0]?.price ?? 0)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ModalFooter>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onClose}
            >
              Done
            </button>
          </ModalFooter>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   MODALS — 15 · export
   ========================================================================== */

function ExportModal({
  onExport,
  onClose,
}: {
  onExport: (scope: string, format: "csv" | "txt") => void;
  onClose: () => void;
}) {
  const [scope, setScope] = useState("stock");
  const [format, setFormat] = useState<"csv" | "txt">("csv");

  return (
    <div>
      <div className="gm-field">
        <label className="gm-f-label" htmlFor="export-scope">
          What should the file contain?
        </label>
        <select
          id="export-scope"
          className="gm-select"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        >
          <option value="stock">Stock sheet (current balances)</option>
          <option value="applications">Application log (traceability)</option>
          <option value="purchases">AI purchase list</option>
          <option value="suppliers">Supplier directory</option>
        </select>
      </div>
      <div className="gm-seg mb-3">
        <button
          type="button"
          className={format === "csv" ? "on" : ""}
          onClick={() => setFormat("csv")}
        >
          CSV (Excel)
        </button>
        <button
          type="button"
          className={format === "txt" ? "on" : ""}
          onClick={() => setFormat("txt")}
        >
          Text (WhatsApp)
        </button>
      </div>
      <div className="gm-plan-rec mb-3">
        <strong>Ready to download</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          Files are generated in your browser — nothing leaves the farm unless
          you send it yourself.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onExport(scope, format)}
        >
          <Download /> Download {format.toUpperCase()}
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 16 · regenerate the AI purchase list
   ========================================================================== */

function AiRegenModal({
  horizon,
  onSave,
  onClose,
}: {
  horizon: number;
  onSave: (horizon: number, categories: string[]) => void;
  onClose: () => void;
}) {
  const [days, setDays] = useState(horizon);
  const [categories, setCategories] = useState<string[]>([
    "fertilizer",
    "protection",
  ]);

  return (
    <div>
      <div className="gm-field">
        <span className="gm-f-label">Planning horizon</span>
        <div className="gm-seg">
          {[14, 30, 60].map((value) => (
            <button
              key={value}
              type="button"
              className={days === value ? "on" : ""}
              onClick={() => setDays(value)}
            >
              Next {value} days
            </button>
          ))}
        </div>
      </div>

      <p className="gm-f-label mb-1">Plan for these input groups</p>
      {(Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]).map(
        (key) => (
          <button
            key={key}
            type="button"
            className={`gm-checkcard ${categories.includes(key) ? "on" : ""}`}
            onClick={() =>
              setCategories((current) =>
                current.includes(key)
                  ? current.filter((row) => row !== key)
                  : [...current, key],
              )
            }
          >
            <input
              type="checkbox"
              checked={categories.includes(key)}
              readOnly
              tabIndex={-1}
            />
            <span>
              <strong>{CATEGORY_LABEL[key]}</strong>
              <small>
                {CATALOG_CATEGORIES[key as keyof typeof CATALOG_CATEGORIES]}{" "}
                catalog products · {CATEGORY_SWAHILI[key]}
              </small>
            </span>
          </button>
        ),
      )}

      <div className="gm-plan-rec mt-3">
        <strong>What the AI reads</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          {AI_REASONS.join(" · ")}
        </p>
      </div>

      <WizardActions
        step={0}
        last={0}
        onBack={onClose}
        onNext={() => onSave(days, categories)}
        nextDisabled={!categories.length}
        finishLabel="Rebuild the list"
      />
    </div>
  );
}

/* ==========================================================================
   MODALS — 17 · swap supplier
   ========================================================================== */

function SwapSupplierModal({
  line,
  onSwap,
  onClose,
}: {
  line: PurchaseSuggestion;
  onSwap: (supplierId: string, price: number) => void;
  onClose: () => void;
}) {
  const offers = offersFor(line.itemId);
  const fallback = [...SUPPLIERS]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  return (
    <div>
      <div className="gm-plan-rec mb-3">
        <strong>
          {line.qty} {line.unit} of {line.name}
        </strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          Currently priced at {money(line.estCost)} from{" "}
          {SUPPLIERS.find((supplier) => supplier.id === line.supplierId)
            ?.name ?? "your saved supplier"}
          .
        </p>
      </div>

      {offers.length ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Distance</th>
                <th>Unit price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offers.map(({ supplier, offer }) => (
                <tr key={`${supplier.id}-${offer.pack}`}>
                  <td>
                    <strong>{supplier.name}</strong>
                    <br />
                    <small className="text-muted">
                      {supplier.deliveryNote}
                    </small>
                  </td>
                  <td>{supplier.distanceKm} km</td>
                  <td className="font-display">{money(offer.price)}</td>
                  <td className="font-display">
                    {money(offer.price * line.qty)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      disabled={offer.stock < 1}
                      onClick={() => onSwap(supplier.id, offer.price)}
                    >
                      Choose
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Nearest suppliers</th>
                <th>Distance</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fallback.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <strong>{supplier.name}</strong>
                    <br />
                    <small className="text-muted">
                      No published price — quote on request
                    </small>
                  </td>
                  <td>{supplier.distanceKm} km</td>
                  <td>
                    <a href={telHref(supplier.phone)}>{supplier.phone}</a>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() =>
                        onSwap(supplier.id, Math.round(line.estCost / line.qty))
                      }
                    >
                      Choose
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Keep current supplier
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 18 · storage locations
   ========================================================================== */

function StoresManager({
  stores,
  stock,
  onSave,
  onClose,
}: {
  stores: StoreLocation[];
  stock: StockRow[];
  onSave: (next: StoreLocation[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<StoreLocation[]>(stores);
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");

  const update = (id: string, patch: Partial<StoreLocation>) =>
    setDraft((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  return (
    <div>
      {draft.map((store) => {
        const lines = stock.filter((row) => row.storeId === store.id);
        return (
          <div key={store.id} className="gm-check-row">
            <span className="gm-mega-icon">
              <Warehouse />
            </span>
            <span style={{ flex: 1 }}>
              <input
                className="gm-input"
                aria-label={`Name for ${store.name}`}
                value={store.name}
                onChange={(event) =>
                  update(store.id, { name: event.target.value })
                }
              />
              <input
                className="gm-input mt-1"
                aria-label={`Conditions for ${store.name}`}
                value={store.condition}
                onChange={(event) =>
                  update(store.id, { condition: event.target.value })
                }
              />
              <small className="d-block mt-1">
                {lines.length} stock line{lines.length === 1 ? "" : "s"} ·{" "}
                {store.kind} · {store.usedPct}% full · {store.note}
              </small>
            </span>
          </div>
        );
      })}

      <div className="gm-form-grid mt-3">
        <Field label="New location name">
          <input
            className="gm-input"
            value={name}
            placeholder="Plot 3 field box"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Conditions">
          <input
            className="gm-input"
            value={condition}
            placeholder="Locked, shaded, off the ground"
            onChange={(event) => setCondition(event.target.value)}
          />
        </Field>
      </div>

      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          disabled={!name}
          onClick={() => {
            setDraft((rows) => [
              ...rows,
              {
                id: `store-${Date.now()}`,
                name,
                kind: "New location",
                condition: condition || "To be described",
                capacity: 10,
                usedPct: 0,
                note: "Added by the farmer",
              },
            ]);
            setName("");
            setCondition("");
          }}
        >
          <Plus /> Add location
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onSave(draft)}
        >
          <Check /> Save locations
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 19 · price alert
   ========================================================================== */

function PriceAlertForm({
  item,
  onSave,
  onClose,
}: {
  item: CatalogItem | null;
  onSave: (alert: PriceAlert) => void;
  onClose: () => void;
}) {
  const latest = item?.priceHistory[item.priceHistory.length - 1] ?? 5000;
  const [label, setLabel] = useState(item?.name ?? "DAP");
  const [target, setTarget] = useState(String(Math.round(latest * 0.95)));
  const [direction, setDirection] = useState<"below" | "above">("below");
  const [phone, setPhone] = useState(FARM_CONTEXT.phone);

  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Input to watch" full>
          <input
            className="gm-input"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </Field>
        <Field label="Alert when the price goes">
          <select
            className="gm-select"
            value={direction}
            onChange={(event) =>
              setDirection(event.target.value as "below" | "above")
            }
          >
            <option value="below">Below my target</option>
            <option value="above">Above my target</option>
          </select>
        </Field>
        <Field label="Target price (KES)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={target}
            onChange={(event) =>
              setTarget(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="SMS to" full>
          <input
            className="gm-input"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value.replace(/[^\d ]/g, "").slice(0, 12))
            }
          />
        </Field>
      </div>

      <div className="gm-plan-rec mb-3">
        <strong>
          Today's shelf price is {money(latest)} for {item?.pack ?? "the pack"}
        </strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          GrowMO checks ten Kiambu suppliers every morning and texts you the
          moment {label} hits {money(Number(target) || 0)}.
        </p>
      </div>

      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!Number(target)}
          onClick={() =>
            onSave({
              id: `alert-${Date.now()}`,
              label,
              target: Number(target),
              direction,
              phone,
            })
          }
        >
          <BellRing /> Create alert
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 20 · remove a purchase line (destructive)
   ========================================================================== */

function DeleteLineConfirm({
  line,
  onCancel,
  onDelete,
}: {
  line: PurchaseSuggestion;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <div className="gm-plan-rec mb-3">
        <strong>
          {line.qty} {line.unit} of {line.name} · {money(line.estCost)}
        </strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          {line.reason}
        </p>
      </div>
      <button
        type="button"
        className={`gm-checkcard ${confirmed ? "on" : ""}`}
        onClick={() => setConfirmed((value) => !value)}
      >
        <input type="checkbox" checked={confirmed} readOnly tabIndex={-1} />
        <span>
          <strong>Yes, remove it from my list</strong>
          <small>
            The AI will suggest it again if the crop schedule still needs it.
          </small>
        </span>
      </button>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Keep it
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          disabled={!confirmed}
          onClick={onDelete}
        >
          <Trash2 /> Remove line
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 21 · batch and expiry
   ========================================================================== */

function BatchForm({
  row,
  onSave,
  onClose,
}: {
  row: StockRow;
  onSave: (batch: string, expiry: string | null) => void;
  onClose: () => void;
}) {
  const [batch, setBatch] = useState(row.batch === "—" ? "" : row.batch);
  const [expiry, setExpiry] = useState(row.expiry ?? "");

  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Batch number">
          <input
            className="gm-input"
            value={batch}
            placeholder="MZ-1188"
            onChange={(event) => setBatch(event.target.value)}
          />
        </Field>
        <Field label="Expiry date">
          <input
            className="gm-input"
            value={expiry}
            placeholder="30 Jun 2027 (leave blank if none)"
            onChange={(event) => setExpiry(event.target.value)}
          />
        </Field>
      </div>
      <div className="gm-plan-rec mb-3">
        <strong>Why batches matter</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          If a spray goes wrong you can prove exactly which product and batch
          was used — that protects you with buyers and the county extension
          officer.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!batch}
          onClick={() => onSave(batch, expiry || null)}
        >
          <Check /> Save batch
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 22 · add a supplier
   ========================================================================== */

function AddSupplierWizard({
  onSave,
  onClose,
}: {
  onSave: (supplier: Supplier) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [type, setType] = useState("Agro-vet");
  const [town, setTown] = useState("Githunguri");
  const [phone, setPhone] = useState("");
  const [distance, setDistance] = useState("2");
  const [till, setTill] = useState("Till 0000000");
  const [offerItemId, setOfferItemId] = useState("cat-can");
  const [item, setItem] = useState("CAN 26:0:0");
  const [pack, setPack] = useState("50 kg");
  const [price, setPrice] = useState("5000");

  const valid = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 9;

  return (
    <div>
      <Stepper
        steps={["Supplier", "First offer"]}
        current={step}
        onStep={setStep}
      />

      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Business name" full>
            <input
              className="gm-input"
              value={name}
              placeholder="Githunguri Green Agrovet"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Type">
            <select
              className="gm-select"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option>Agro-vet</option>
              <option>Seed company</option>
              <option>Fertilizer specialist</option>
              <option>Crop protection</option>
              <option>Manure supplier</option>
              <option>Packaging & irrigation</option>
            </select>
          </Field>
          <Field label="Town">
            <input
              className="gm-input"
              value={town}
              onChange={(event) => setTown(event.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className="gm-input"
              value={phone}
              placeholder="0712 345 678"
              onChange={(event) =>
                setPhone(event.target.value.replace(/[^\d ]/g, "").slice(0, 12))
              }
            />
          </Field>
          <Field label="Distance (km)">
            <input
              className="gm-input"
              inputMode="decimal"
              value={distance}
              onChange={(event) =>
                setDistance(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 5),
                )
              }
            />
          </Field>
          <Field label="M-Pesa till / paybill" full>
            <input
              className="gm-input"
              value={till}
              onChange={(event) => setTill(event.target.value)}
            />
          </Field>
          {valid ? null : (
            <p className="gm-ferr full">
              Add the business name and a phone number to continue.
            </p>
          )}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="First product they stock" full>
            <select
              className="gm-select"
              value={offerItemId}
              onChange={(event) => {
                const nextId = event.target.value;
                const nextItem = INPUT_CATALOG.find(
                  (entry) => entry.id === nextId,
                );
                setOfferItemId(nextId);
                setItem(nextItem?.name ?? item);
                setPack(nextItem?.pack ?? pack);
                setPrice(String(nextItem?.priceMax ?? price));
              }}
            >
              {INPUT_CATALOG.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} · {entry.pack}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pack size">
            <input
              className="gm-input"
              value={pack}
              onChange={(event) => setPack(event.target.value)}
            />
          </Field>
          <Field label="Shelf price (KES)">
            <input
              className="gm-input"
              inputMode="numeric"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </Field>
          <div className="full gm-plan-rec">
            <strong>Price checks start tomorrow</strong>
            <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
              GrowMO will SMS {name || "this supplier"} each morning for today's
              price and add it to your comparisons.
            </p>
          </div>
        </div>
      ) : null}

      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          onSave({
            id: `sup-${Date.now()}`,
            name: name.trim(),
            type,
            town,
            county: "Kiambu",
            distanceKm: Number(distance || 1),
            phone: phone.trim() || "0712 345 678",
            till,
            rating: 4.0,
            reviews: 1,
            verified: false,
            hours: "Mon–Sat 7:00–18:00",
            minOrder: "No minimum",
            deliveryFee: 200,
            deliveryNote: "Ask when you call — delivery varies by load",
            products: [item],
            offers: [
              {
                itemId: offerItemId,
                item,
                pack,
                price: Number(price || 0),
                stock: 10,
              },
            ],
            mapQuery: `${town}, Kiambu`,
          })
        }
        nextDisabled={step === 0 ? !valid : !Number(price)}
        finishLabel="Add supplier"
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS — 23 · how the purchase list works
   ========================================================================== */

function MethodModal({
  onClose,
  onOpenStock,
}: {
  onClose: () => void;
  onOpenStock: () => void;
}) {
  return (
    <div>
      {[
        {
          icon: Wheat,
          title: "1 · Your crop schedule",
          body: "Task dates from the crop tracker set the deadline for every input — CAN before top dressing, Mancozeb before the PHI window closes.",
        },
        {
          icon: Boxes,
          title: "2 · What the store already holds",
          body: "GrowMO subtracts current stock and anything already on order, so you never buy a second bag of DAP by mistake.",
        },
        {
          icon: CloudSun,
          title: "3 · Kiambu weather outlook",
          body: "A wet week pulls fungicide forward and pushes foliar feeds back — the list re-orders itself accordingly.",
        },
        {
          icon: Store,
          title: "4 · Today's supplier prices",
          body: "Ten registered agro-vets are checked each morning; the cheapest verified offer within your delivery window wins.",
        },
      ].map((row) => (
        <div key={row.title} className="gm-check-row">
          <span className="gm-mega-icon">
            <row.icon />
          </span>
          <span style={{ flex: 1 }}>
            <strong>{row.title}</strong>
            <small>{row.body}</small>
          </span>
        </div>
      ))}

      <div className="gm-plan-rec mt-3">
        <strong>Refreshed daily at 05:00</strong>
        <p className="mb-0 mt-1" style={{ fontSize: "0.86rem" }}>
          You can always override a suggestion — edit the quantity, swap the
          supplier or remove the line. Nothing is bought without your M-Pesa
          PIN.
        </p>
      </div>

      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onOpenStock}
        >
          <Boxes /> See my stock
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Got it
        </button>
      </ModalFooter>
    </div>
  );
}
