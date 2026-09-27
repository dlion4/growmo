/* ============================================================================
   PAGE 21 — BUYER NEGOTIATIONS, ORDERS & SHAREABLE CROP PORTFOLIO (/app/orders)

   Blueprint sections implemented:
   21.1 crop portfolio builder      21.2 shareable link system
   21.3 buyer interface             21.4 order form
   21.5 negotiation workflow        21.6 order management
   21.7 contract generation         21.8 buyer CRM
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  HandCoins,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  QrCode,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  OrdersModalHub,
  type OrdersModalId,
} from "../../components/app/OrdersModals";
import {
  BuyerSummaryRow,
  OrderMetric,
  OrdersHero,
  PhotoTile,
  PortfolioCard,
} from "../../components/app/OrdersWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AVAILABILITY,
  BUYERS,
  type Buyer,
  CONTRACT,
  FARM_IDENTITY,
  FARM_ORDERS,
  type FarmOrder,
  GAP_CHECKLIST,
  INQUIRIES,
  type Inquiry,
  inquiryTone,
  LINK_ANALYTICS,
  NEGOTIATION_THREAD,
  ORDER_CONTEXT,
  type OrderStatus,
  orderTone,
  PAYMENT_TERMS,
  PORTFOLIO_PHOTOS,
  PORTFOLIOS,
  type Portfolio,
  PRIMARY_CROP,
} from "../../data/app/orders";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/orders")({
  component: OrdersPortfolioPage,
});

type View =
  | "portfolios"
  | "inquiries"
  | "orders"
  | "contracts"
  | "buyers"
  | "links";
type PortfolioTab =
  | "overview"
  | "gaps"
  | "gallery"
  | "availability"
  | "pricing";
type DrawerId = "portfolio" | "inquiry" | "order" | "buyer" | null;

function downloadOrders(rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "delion-farm-orders.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function OrdersPortfolioPage() {
  const toast = useToast();
  const [view, setView] = useState<View>("portfolios");
  const [portfolioTab, setPortfolioTab] = useState<PortfolioTab>("overview");
  const [portfolios, setPortfolios] = useState(PORTFOLIOS);
  const [inquiries, setInquiries] = useState(INQUIRIES);
  const [orders, setOrders] = useState(FARM_ORDERS);
  const [buyers, setBuyers] = useState(BUYERS);
  const [modal, setModal] = useState<OrdersModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    PORTFOLIOS[0],
  );
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(
    INQUIRIES[0],
  );
  const [selectedOrder, setSelectedOrder] = useState<FarmOrder | null>(
    FARM_ORDERS[0],
  );
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(BUYERS[2]);
  const [menu, setMenu] = useState<string | null>(null);
  const [inquiryStatus, setInquiryStatus] = useState<"All" | Inquiry["status"]>(
    "All",
  );
  const [inquiryPage, setInquiryPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState<"All" | OrderStatus>("All");
  const [orderPage, setOrderPage] = useState(1);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerPage, setBuyerPage] = useState(1);

  const filteredInquiries = useMemo(
    () =>
      inquiries.filter(
        (item) => inquiryStatus === "All" || item.status === inquiryStatus,
      ),
    [inquiries, inquiryStatus],
  );
  const inquiryPerPage = 5;
  const inquiryPages = Math.max(
    1,
    Math.ceil(filteredInquiries.length / inquiryPerPage),
  );
  const shownInquiries = filteredInquiries.slice(
    (inquiryPage - 1) * inquiryPerPage,
    inquiryPage * inquiryPerPage,
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (item) => orderStatus === "All" || item.status === orderStatus,
      ),
    [orders, orderStatus],
  );
  const orderPerPage = 5;
  const orderPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / orderPerPage),
  );
  const shownOrders = filteredOrders.slice(
    (orderPage - 1) * orderPerPage,
    orderPage * orderPerPage,
  );
  const filteredBuyers = useMemo(
    () =>
      buyers.filter((buyer) =>
        `${buyer.name} ${buyer.company} ${buyer.location} ${buyer.crops}`
          .toLowerCase()
          .includes(buyerSearch.toLowerCase()),
      ),
    [buyers, buyerSearch],
  );
  const buyerPerPage = 5;
  const buyerPages = Math.max(
    1,
    Math.ceil(filteredBuyers.length / buyerPerPage),
  );
  const shownBuyers = filteredBuyers.slice(
    (buyerPage - 1) * buyerPerPage,
    buyerPage * buyerPerPage,
  );
  const livePortfolios = portfolios.filter(
    (item) => item.state === "Live",
  ).length;
  const confirmedValue = orders
    .filter((order) => order.status === "Confirmed")
    .reduce((sum, order) => sum + order.total, 0);
  const committed = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (sum, order) => sum + (order.crop === "Cabbage" ? order.quantity : 0),
      0,
    );

  const saveWorkflow = (message: string) => {
    if (modal === "build-portfolio")
      setPortfolios((items) => [
        ...items,
        {
          ...PORTFOLIOS[5],
          id: `GRM-KMB-2027-${String(items.length + 1).padStart(3, "0")}`,
          crop: "New crop portfolio",
          state: "Draft",
          linkViews: 0,
        },
      ]);
    if (modal === "publish-portfolio" && selectedPortfolio)
      setPortfolios((items) =>
        items.map((item) =>
          item.id === selectedPortfolio.id ? { ...item, state: "Live" } : item,
        ),
      );
    if (modal === "archive-portfolio" && selectedPortfolio)
      setPortfolios((items) =>
        items.filter((item) => item.id !== selectedPortfolio.id),
      );
    if (modal === "accept-offer" && selectedInquiry) {
      setInquiries((items) =>
        items.map((item) =>
          item.id === selectedInquiry.id
            ? { ...item, status: "Accepted" }
            : item,
        ),
      );
      setOrders((items) => [
        ...items,
        {
          id: `ORD-${String(items.length + 1).padStart(3, "0")}`,
          buyerId: selectedInquiry.buyerId,
          buyer: selectedInquiry.company,
          crop: selectedInquiry.crop,
          quantity: selectedInquiry.quantity,
          unit: selectedInquiry.unit,
          price: selectedInquiry.proposedPrice,
          total: selectedInquiry.quantity * selectedInquiry.proposedPrice,
          deliveryDate: selectedInquiry.date,
          delivery: selectedInquiry.delivery,
          status: "Confirmed",
          payment: "Pending delivery",
          paymentDetail: selectedInquiry.payment,
        },
      ]);
    }
    if (modal === "decline-offer" && selectedInquiry)
      setInquiries((items) =>
        items.map((item) =>
          item.id === selectedInquiry.id
            ? { ...item, status: "Declined" }
            : item,
        ),
      );
    if (modal === "cancel-order" && selectedOrder)
      setOrders((items) =>
        items.map((item) =>
          item.id === selectedOrder.id
            ? { ...item, status: "Cancelled" }
            : item,
        ),
      );
    if (
      (modal === "collect-deposit" || modal === "confirm-payment") &&
      selectedOrder
    )
      setOrders((items) =>
        items.map((item) =>
          item.id === selectedOrder.id
            ? {
                ...item,
                payment:
                  modal === "collect-deposit" ? "Deposit received" : "Paid",
                paymentDetail:
                  modal === "collect-deposit"
                    ? `Deposit received · ${kes(Math.round(item.total / 2))}`
                    : "M-Pesa settlement confirmed",
              }
            : item,
        ),
      );
    if (modal === "create-order")
      setOrders((items) => [
        ...items,
        {
          ...FARM_ORDERS[1],
          id: `ORD-${String(items.length + 1).padStart(3, "0")}`,
          status: "Confirmed",
          deliveryDate: "23 Jan 2027",
        },
      ]);
    if (modal === "add-buyer")
      setBuyers((items) => [
        ...items,
        {
          ...BUYERS[9],
          id: `BYR-${String(items.length + 1).padStart(3, "0")}`,
          name: "New buyer",
          company: "New farm buyer",
          phone: "0711 000 000",
          orders: 0,
          totalSpent: 0,
          lastOrder: "No orders",
        },
      ]);
    toast.notify(message, "success");
  };

  const exportNow = () => {
    downloadOrders([
      ["Order", "Buyer", "Crop", "Quantity", "Total", "Status", "Payment"],
      ...orders.map((item) => [
        item.id,
        item.buyer,
        item.crop,
        `${item.quantity} ${item.unit}`,
        String(item.total),
        item.status,
        item.payment,
      ]),
    ]);
    toast.notify("Orders CSV downloaded", "success");
  };
  const openPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setDrawer("portfolio");
  };
  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setSelectedBuyer(
      buyers.find((buyer) => buyer.id === inquiry.buyerId) ?? null,
    );
    setDrawer("inquiry");
  };
  const openOrder = (order: FarmOrder) => {
    setSelectedOrder(order);
    setSelectedBuyer(
      buyers.find((buyer) => buyer.id === order.buyerId) ?? null,
    );
    setDrawer("order");
  };
  const openBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setDrawer("buyer");
  };

  const tabs = [
    {
      id: "portfolios" as const,
      label: "Portfolios",
      icon: <Sprout />,
      count: livePortfolios,
    },
    {
      id: "inquiries" as const,
      label: "Inquiries",
      icon: <MessageCircle />,
      count: inquiries.filter((item) => item.status === "New").length,
    },
    {
      id: "orders" as const,
      label: "Orders",
      icon: <ShoppingBasket />,
      count: orders.filter((item) => item.status === "Confirmed").length,
    },
    { id: "contracts" as const, label: "Contracts", icon: <FileText /> },
    {
      id: "buyers" as const,
      label: "Buyer CRM",
      icon: <Users />,
      count: buyers.length,
    },
    { id: "links" as const, label: "Link insights", icon: <Share2 /> },
  ];

  return (
    <main className="gm-app-inner">
      <Reveal>
        <OrdersHero
          metrics={[
            {
              icon: Sprout,
              label: "Live portfolios",
              value: String(livePortfolios),
              note: "Crops visible to buyers",
            },
            {
              icon: CircleDollarSign,
              label: "Confirmed sales",
              value: kes(confirmedValue),
              note: "Current order book",
            },
            {
              icon: PackageCheck,
              label: "Cabbage available",
              value: `${Math.max(0, ORDER_CONTEXT.availableHeads - committed).toLocaleString()} heads`,
              note: "After confirmed allocations",
            },
            {
              icon: MessageCircle,
              label: "New interest",
              value: `${inquiries.filter((item) => item.status === "New").length} inquiries`,
              note: "Needs a farmer reply",
            },
          ]}
          actions={
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => setModal("build-portfolio")}
              >
                <Plus /> Build portfolio
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setModal("share-link")}
              >
                <Share2 /> Share cabbage
              </button>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="Open portfolio tools"
                  onClick={() => setMenu(menu === "tools" ? null : "tools")}
                >
                  <MoreHorizontal />
                </button>
                {menu === "tools" ? (
                  <div className="gm-menu">
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(null);
                        setModal("buyer-preview");
                      }}
                    >
                      <Eye /> Buyer preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(null);
                        setModal("link-settings");
                      }}
                    >
                      <ShieldCheck /> Link settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(null);
                        setModal("export-orders");
                      }}
                    >
                      <FileSpreadsheet /> Prepare sales report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(null);
                        exportNow();
                      }}
                    >
                      <Download /> Download orders CSV
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />
      </Reveal>
      <div className="mt-4">
        <PlannerSubtabs
          value={view}
          items={tabs}
          onChange={setView}
          label="Orders and portfolio workspace"
        />
      </div>
      {view === "portfolios" ? (
        <PortfolioSection
          portfolios={portfolios}
          selected={selectedPortfolio}
          tab={portfolioTab}
          onTab={setPortfolioTab}
          onOpen={openPortfolio}
          onEdit={(item) => {
            setSelectedPortfolio(item);
            setModal("edit-portfolio");
          }}
          onShare={(item) => {
            setSelectedPortfolio(item);
            setModal("share-link");
          }}
          onPublish={() => setModal("publish-portfolio")}
          onEvidence={() => setModal("gaps-evidence")}
          onPhoto={() => setModal("photo-detail")}
          onLink={() => setModal("link-settings")}
        />
      ) : null}
      {view === "inquiries" ? (
        <InquiriesSection
          entries={shownInquiries}
          total={filteredInquiries.length}
          filter={inquiryStatus}
          page={inquiryPage}
          pages={inquiryPages}
          onFilter={(value) => {
            setInquiryStatus(value);
            setInquiryPage(1);
          }}
          onPage={setInquiryPage}
          onNew={() => setModal("new-inquiry")}
          onOpen={openInquiry}
        />
      ) : null}
      {view === "orders" ? (
        <OrdersSection
          entries={shownOrders}
          total={filteredOrders.length}
          filter={orderStatus}
          page={orderPage}
          pages={orderPages}
          onFilter={(value) => {
            setOrderStatus(value);
            setOrderPage(1);
          }}
          onPage={setOrderPage}
          onNew={() => setModal("create-order")}
          onOpen={openOrder}
          onExport={() => setModal("export-orders")}
        />
      ) : null}
      {view === "contracts" ? (
        <ContractsSection
          onGenerate={() => setModal("generate-contract")}
          onOpen={() => setModal("contract-detail")}
          onSend={() => setModal("send-esign")}
          onDownload={() => setModal("download-contract")}
        />
      ) : null}
      {view === "buyers" ? (
        <BuyersSection
          buyers={shownBuyers}
          total={filteredBuyers.length}
          search={buyerSearch}
          page={buyerPage}
          pages={buyerPages}
          onSearch={(value) => {
            setBuyerSearch(value);
            setBuyerPage(1);
          }}
          onPage={setBuyerPage}
          onOpen={openBuyer}
          onRate={(buyer) => {
            setSelectedBuyer(buyer);
            setModal("rate-buyer");
          }}
          onAdd={() => setModal("add-buyer")}
          onExport={() => setModal("export-orders")}
        />
      ) : null}
      {view === "links" ? (
        <LinksSection
          onShare={() => setModal("share-link")}
          onQr={() => setModal("qr-link")}
          onSettings={() => setModal("link-settings")}
          onPreview={() => setModal("buyer-preview")}
        />
      ) : null}

      <DashboardDrawer
        open={drawer === "portfolio" && Boolean(selectedPortfolio)}
        title={
          selectedPortfolio
            ? `${selectedPortfolio.crop} · buyer portfolio`
            : "Crop portfolio"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("archive-portfolio");
              }}
            >
              <Trash2 /> Archive
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setDrawer(null);
                setModal("edit-portfolio");
              }}
            >
              <Pencil /> Edit portfolio
            </button>
          </>
        }
      >
        {selectedPortfolio ? (
          <PortfolioDrawer
            portfolio={selectedPortfolio}
            onShare={() => {
              setDrawer(null);
              setModal("share-link");
            }}
            onQr={() => {
              setDrawer(null);
              setModal("qr-link");
            }}
            onSettings={() => {
              setDrawer(null);
              setModal("link-settings");
            }}
          />
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "inquiry" && Boolean(selectedInquiry)}
        title={
          selectedInquiry
            ? `${selectedInquiry.id} · buyer negotiation`
            : "Buyer negotiation"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("message-buyer");
              }}
            >
              <Send /> Message
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setDrawer(null);
                setModal("accept-offer");
              }}
            >
              <CheckCircle2 /> Accept
            </button>
          </>
        }
      >
        {selectedInquiry ? (
          <InquiryDrawer
            inquiry={selectedInquiry}
            buyer={selectedBuyer}
            onAction={(next) => {
              setDrawer(null);
              setModal(next);
            }}
          />
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "order" && Boolean(selectedOrder)}
        title={
          selectedOrder ? `${selectedOrder.id} · sales order` : "Sales order"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("schedule-delivery");
              }}
            >
              <CalendarDays /> Delivery
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-mpesa"
              onClick={() => {
                setDrawer(null);
                setModal(
                  selectedOrder?.payment === "Deposit received"
                    ? "confirm-payment"
                    : "collect-deposit",
                );
              }}
            >
              <HandCoins /> Payment
            </button>
          </>
        }
      >
        {selectedOrder ? (
          <OrderDrawer
            order={selectedOrder}
            onAction={(next) => {
              setDrawer(null);
              setModal(next);
            }}
          />
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "buyer" && Boolean(selectedBuyer)}
        title={
          selectedBuyer ? `${selectedBuyer.name} · Buyer CRM` : "Buyer CRM"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("buyer-note");
              }}
            >
              <Pencil /> Add note
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setDrawer(null);
                setModal("edit-buyer");
              }}
            >
              Edit buyer
            </button>
          </>
        }
      >
        {selectedBuyer ? (
          <BuyerDrawer
            buyer={selectedBuyer}
            onRate={() => {
              setDrawer(null);
              setModal("rate-buyer");
            }}
          />
        ) : null}
      </DashboardDrawer>
      <OrdersModalHub
        active={modal}
        portfolio={selectedPortfolio}
        inquiry={selectedInquiry}
        order={selectedOrder}
        buyer={selectedBuyer}
        onClose={() => setModal(null)}
        onSaved={saveWorkflow}
      />
    </main>
  );
}

function PortfolioSection({
  portfolios,
  selected,
  tab,
  onTab,
  onOpen,
  onEdit,
  onShare,
  onPublish,
  onEvidence,
  onPhoto,
  onLink,
}: {
  portfolios: Portfolio[];
  selected: Portfolio | null;
  tab: PortfolioTab;
  onTab: (tab: PortfolioTab) => void;
  onOpen: (portfolio: Portfolio) => void;
  onEdit: (portfolio: Portfolio) => void;
  onShare: (portfolio: Portfolio) => void;
  onPublish: () => void;
  onEvidence: () => void;
  onPhoto: () => void;
  onLink: () => void;
}) {
  const miniTabs = [
    { id: "overview" as const, label: "Crop details" },
    { id: "gaps" as const, label: "GAP evidence", count: GAP_CHECKLIST.length },
    {
      id: "gallery" as const,
      label: "Gallery",
      count: PORTFOLIO_PHOTOS.length,
    },
    { id: "availability" as const, label: "Availability" },
    { id: "pricing" as const, label: "Pricing & terms" },
  ];
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="21.1 · Crop portfolio builder"
        title="Show the evidence behind a great crop"
        subtitle="A professional offer starts with farm identity, crop truth, clear availability and the records a serious buyer asks to see."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onLink}
            >
              <ShieldCheck /> Link settings
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onPublish}
            >
              <Share2 /> Publish portfolio
            </button>
          </div>
        }
      />
      <div className="row g-3">
        {portfolios.map((portfolio) => (
          <div className="col-md-6 col-xl-4" key={portfolio.id}>
            <PortfolioCard
              portfolio={portfolio}
              onOpen={() => onOpen(portfolio)}
              onEdit={() => onEdit(portfolio)}
              onShare={() => onShare(portfolio)}
            />
          </div>
        ))}
      </div>
      <div className="gm-card p-3 mt-4">
        <div className="gm-plan-detail-hero">
          <span className="gm-mega-icon">
            <BadgeCheck />
          </span>
          <div style={{ flex: 1 }}>
            <span className="gm-eyebrow">Selected public portfolio</span>
            <h3 className="font-display mb-1">
              Delion Farm · Cabbage Gloria F1
            </h3>
            <p className="mb-0 text-muted">
              {FARM_IDENTITY.county} · {FARM_IDENTITY.subCounty} ·{" "}
              {FARM_IDENTITY.size} · {FARM_IDENTITY.rating}
            </p>
          </div>
          <StatusChip
            label={FARM_IDENTITY.verified ? "GrowMO verified" : "Review needed"}
            tone={FARM_IDENTITY.verified ? "low" : "medium"}
          />
        </div>
        <div className="mt-3">
          <PlannerSubtabs
            value={tab}
            items={miniTabs}
            onChange={onTab}
            label="Portfolio content sections"
          />
        </div>
        {tab === "overview" ? <OverviewContent /> : null}
        {tab === "gaps" ? <GapContent onEvidence={onEvidence} /> : null}
        {tab === "gallery" ? <GalleryContent onPhoto={onPhoto} /> : null}
        {tab === "availability" ? <AvailabilityContent /> : null}
        {tab === "pricing" ? <PricingContent /> : null}
      </div>
      {selected ? (
        <div className="gm-check-row mt-3">
          <Eye />
          <span style={{ flex: 1 }}>
            <strong>
              {selected.linkViews} buyer views on {selected.crop}
            </strong>
            <small>
              Open the portfolio to preview the buyer-facing record or share a
              protected live link.
            </small>
          </span>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={() => onOpen(selected)}
          >
            Open selected
          </button>
        </div>
      ) : null}
    </section>
  );
}

function OverviewContent() {
  const details = [
    [
      "Farm identity",
      `${FARM_IDENTITY.farm} · ${FARM_IDENTITY.farmer} · ${FARM_IDENTITY.cooperative}`,
    ],
    [
      "Location",
      `${FARM_IDENTITY.subCounty}, ${FARM_IDENTITY.county} · GPS ${FARM_IDENTITY.coordinates}`,
    ],
    [
      "Crop & seed",
      `${PRIMARY_CROP.crop} · ${PRIMARY_CROP.variety} · ${PRIMARY_CROP.seedCompany}`,
    ],
    [
      "Plot & planting",
      `${PRIMARY_CROP.plot} · ${PRIMARY_CROP.acreage} · planted ${PRIMARY_CROP.planted}`,
    ],
    [
      "Harvest plan",
      `${PRIMARY_CROP.expectedMaturity} · ${PRIMARY_CROP.harvestWindow}`,
    ],
    ["Soil & irrigation", `${PRIMARY_CROP.soil} · ${PRIMARY_CROP.water}`],
    [
      "Nutrition & IPM",
      `${PRIMARY_CROP.fertiliser} · ${PRIMARY_CROP.pestPlan}`,
    ],
    ["PHI & residue", `${PRIMARY_CROP.phi} · ${PRIMARY_CROP.residue}`],
  ];
  return (
    <div className="row g-3 mt-1">
      {details.map(([label, value]) => (
        <div className="col-md-6" key={label}>
          <div className="gm-check-row h-100">
            <Sprout />
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GapContent({ onEvidence }: { onEvidence: () => void }) {
  return (
    <div className="mt-3">
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
        <p className="text-muted mb-0">
          The buyer portfolio shows this checklist without exposing internal
          records.
        </p>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onEvidence}
        >
          <ShieldCheck /> Open evidence pack
        </button>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Good agricultural practice</th>
              <th>Evidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {GAP_CHECKLIST.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.item}</strong>
                </td>
                <td>{item.evidence}</td>
                <td>
                  <StatusChip label={item.status} tone="low" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function GalleryContent({ onPhoto }: { onPhoto: () => void }) {
  return (
    <div className="row g-3 mt-3">
      {PORTFOLIO_PHOTOS.map((photo) => (
        <div className="col-sm-6 col-lg-4" key={photo.id}>
          <PhotoTile {...photo} onOpen={onPhoto} />
        </div>
      ))}
    </div>
  );
}
function AvailabilityContent() {
  return (
    <div className="row g-3 mt-3">
      <div className="col-lg-5">
        <div className="gm-plan-detail-hero h-100">
          <span className="gm-mega-icon">
            <PackageCheck />
          </span>
          <div style={{ flex: 1 }}>
            <small className="text-muted d-block">Ready to sell</small>
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.65rem" }}
            >
              {AVAILABILITY.available.toLocaleString()} heads
            </strong>
            <p className="mb-0 text-muted">
              {AVAILABILITY.window} · minimum {AVAILABILITY.minimum}
            </p>
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="gm-check-list">
          <div className="gm-check-row">
            <CalendarDays />
            <span>
              <strong>Pickup & packing</strong>
              <small>
                {AVAILABILITY.pickup} · {AVAILABILITY.packing}
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <MapPin />
            <span>
              <strong>Delivery choice</strong>
              <small>{AVAILABILITY.delivery}</small>
            </span>
          </div>
          <div className="gm-check-row">
            <ShoppingBasket />
            <span>
              <strong>Committed crop</strong>
              <small>
                {AVAILABILITY.committed.toLocaleString()} heads already reserved
                for Karen Greens Restaurant.
              </small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
function PricingContent() {
  return (
    <div className="mt-3">
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Expected quantity</th>
              <th>Price / head</th>
              <th>Crate · 30 heads</th>
              <th>Est. / tonne</th>
            </tr>
          </thead>
          <tbody>
            {AVAILABILITY.grades.map((grade) => (
              <tr key={grade.grade}>
                <td>
                  <strong>{grade.grade}</strong>
                  <small className="d-block text-muted">{grade.detail}</small>
                </td>
                <td>{grade.count.toLocaleString()} heads</td>
                <td className="font-display">{kes(grade.price)}</td>
                <td className="font-display">{kes(grade.crate)}</td>
                <td className="font-display">{kes(grade.tonne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-md-5">
          <div className="gm-check-row h-100">
            <CircleDollarSign />
            <span>
              <strong>Bulk discounts</strong>
              <small>{AVAILABILITY.discounts.join(" · ")}</small>
            </span>
          </div>
        </div>
        <div className="col-md-7">
          <div className="gm-check-row h-100">
            <HandCoins />
            <span>
              <strong>Payment options</strong>
              <small>
                {PAYMENT_TERMS.map((term) => term.option).join(" · ")}
              </small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InquiriesSection({
  entries,
  total,
  filter,
  page,
  pages,
  onFilter,
  onPage,
  onNew,
  onOpen,
}: {
  entries: Inquiry[];
  total: number;
  filter: "All" | Inquiry["status"];
  page: number;
  pages: number;
  onFilter: (value: "All" | Inquiry["status"]) => void;
  onPage: (page: number) => void;
  onNew: () => void;
  onOpen: (entry: Inquiry) => void;
}) {
  const filters: ("All" | Inquiry["status"])[] = [
    "All",
    "New",
    "Negotiating",
    "Accepted",
    "Declined",
    "Expired",
  ];
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="21.4 & 21.5 · Inquiries and negotiations"
        title="Reply from a position of evidence"
        subtitle="See what each buyer asked for, check their history, and accept or counter without losing the conversation."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
            <Plus /> Add inquiry
          </button>
        }
      />
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
            onClick={() => onFilter(item)}
          >
            {item}
            {item === "New" ? <span className="gm-n">4</span> : null}
          </button>
        ))}
      </div>
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Crop / offer</th>
                <th>Proposed price</th>
                <th>Delivery</th>
                <th>Payment</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.buyer}</strong>
                    <small className="d-block text-muted">
                      {item.company} · {item.phone}
                    </small>
                  </td>
                  <td>
                    <strong>
                      {item.quantity.toLocaleString()} {item.unit}
                    </strong>
                    <small className="d-block text-muted">
                      {item.crop} · {item.grade} · {item.date}
                    </small>
                  </td>
                  <td className="font-display">{kes(item.proposedPrice)}</td>
                  <td>{item.delivery}</td>
                  <td>{item.payment}</td>
                  <td>
                    <StatusChip
                      label={item.status}
                      tone={inquiryTone(item.status)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onOpen(item)}
                    >
                      Negotiate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <Pagination
          page={page}
          total={pages}
          onChange={onPage}
          perPage={5}
          totalItems={total}
        />
      </div>
    </section>
  );
}

function OrdersSection({
  entries,
  total,
  filter,
  page,
  pages,
  onFilter,
  onPage,
  onNew,
  onOpen,
  onExport,
}: {
  entries: FarmOrder[];
  total: number;
  filter: "All" | OrderStatus;
  page: number;
  pages: number;
  onFilter: (value: "All" | OrderStatus) => void;
  onPage: (page: number) => void;
  onNew: () => void;
  onOpen: (entry: FarmOrder) => void;
  onExport: () => void;
}) {
  const filters: ("All" | OrderStatus)[] = [
    "All",
    "Confirmed",
    "Negotiating",
    "Preparing",
    "Delivered",
    "Cancelled",
  ];
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="21.6 · Order management"
        title="Keep crop commitments and money in one place"
        subtitle="Order status, payment status and the delivery promise stay together from the first agreement to handover."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <FileSpreadsheet /> Export
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onNew}
            >
              <Plus /> Create order
            </button>
          </div>
        }
      />
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
            onClick={() => onFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Order / buyer</th>
                <th>Crop</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Payment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.id}</strong>
                    <small className="d-block text-muted">{item.buyer}</small>
                  </td>
                  <td>{item.crop}</td>
                  <td>
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>
                  <td className="font-display">{kes(item.price)}</td>
                  <td className="font-display">{kes(item.total)}</td>
                  <td>
                    {item.deliveryDate}
                    <small className="d-block text-muted">
                      {item.delivery}
                    </small>
                  </td>
                  <td>
                    <StatusChip
                      label={item.status}
                      tone={orderTone(item.status)}
                    />
                  </td>
                  <td>
                    <strong>{item.payment}</strong>
                    <small className="d-block text-muted">
                      {item.paymentDetail}
                    </small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onOpen(item)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <Pagination
          page={page}
          total={pages}
          onChange={onPage}
          perPage={5}
          totalItems={total}
        />
      </div>
    </section>
  );
}

function ContractsSection({
  onGenerate,
  onOpen,
  onSend,
  onDownload,
}: {
  onGenerate: () => void;
  onOpen: () => void;
  onSend: () => void;
  onDownload: () => void;
}) {
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="21.7 · Contract generation"
        title="Turn a good deal into a clear promise"
        subtitle="A simple crop supply agreement aligns quantity, grade, delivery, payment and the fair way to solve a dispute."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onGenerate}
          >
            <FileText /> Generate contract
          </button>
        }
      />
      <div className="gm-card p-4">
        <div className="gm-plan-detail-hero">
          <span className="gm-mega-icon">
            <FileText />
          </span>
          <div style={{ flex: 1 }}>
            <span className="gm-eyebrow">
              {CONTRACT.id} · Ready for signature
            </span>
            <h3 className="font-display mb-1">
              Fresh Produce Kenya Ltd · 8-week cabbage supply
            </h3>
            <p className="mb-0 text-muted">
              {CONTRACT.quantity} · {CONTRACT.duration} · {CONTRACT.price}
            </p>
          </div>
          <StatusChip label="Draft accepted" tone="low" />
        </div>
        <div className="row g-3 mt-1">
          {[
            ["Seller", CONTRACT.seller],
            ["Buyer", CONTRACT.buyer],
            ["Delivery", CONTRACT.delivery],
            ["Payment", CONTRACT.payment],
            ["Quality", CONTRACT.quality],
            ["Dispute", CONTRACT.dispute],
          ].map(([label, value]) => (
            <div className="col-md-6" key={label}>
              <div className="gm-check-row h-100">
                <ClipboardCheck />
                <span>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onOpen}
          >
            Review agreement
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={onDownload}
          >
            <Download /> Download PDF
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={onSend}>
            <Send /> Send for e-signature
          </button>
        </div>
      </div>
    </section>
  );
}

function BuyersSection({
  buyers,
  total,
  search,
  page,
  pages,
  onSearch,
  onPage,
  onOpen,
  onRate,
  onAdd,
  onExport,
}: {
  buyers: Buyer[];
  total: number;
  search: string;
  page: number;
  pages: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onOpen: (buyer: Buyer) => void;
  onRate: (buyer: Buyer) => void;
  onAdd: () => void;
  onExport: () => void;
}) {
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="21.8 · Buyer CRM"
        title="Remember the people behind the purchase order"
        subtitle="Buyer history and your private farm notes make the next negotiation more confident and less risky."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <Download /> Export CRM
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onAdd}
            >
              <Plus /> Add buyer
            </button>
          </div>
        }
      />
      <div className="gm-card p-3 mb-3">
        <label className="gm-field mb-0">
          <span className="gm-field-label">Search buyer CRM</span>
          <span className="gm-search-field">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Buyer, business, town or crop"
            />
          </span>
        </label>
      </div>
      <div className="gm-card p-0 overflow-hidden">
        {buyers.map((buyer) => (
          <BuyerSummaryRow
            buyer={buyer}
            key={buyer.id}
            onOpen={() => onOpen(buyer)}
            onRate={() => onRate(buyer)}
          />
        ))}
      </div>
      <div className="mt-4">
        <Pagination
          page={page}
          total={pages}
          onChange={onPage}
          perPage={5}
          totalItems={total}
        />
      </div>
    </section>
  );
}

function LinksSection({
  onShare,
  onQr,
  onSettings,
  onPreview,
}: {
  onShare: () => void;
  onQr: () => void;
  onSettings: () => void;
  onPreview: () => void;
}) {
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="21.2 & 21.3 · Shareable portfolio"
        title="A link that works harder than a flyer"
        subtitle="Give buyers a polished crop offer, evidence and inquiry path while communication remains protected inside GrowMO."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onSettings}
            >
              <ShieldCheck /> Link settings
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onShare}
            >
              <Share2 /> Share now
            </button>
          </div>
        }
      />
      <div className="row g-3">
        {LINK_ANALYTICS.map((metric) => (
          <div className="col-md-6 col-xl-4" key={metric.id}>
            <OrderMetric
              icon={
                metric.label === "Top referrer"
                  ? Share2
                  : metric.label === "Orders placed"
                    ? ShoppingBasket
                    : Eye
              }
              {...metric}
            />
          </div>
        ))}
      </div>
      <div className="gm-card p-4 mt-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            <span className="gm-eyebrow">Live buyer experience</span>
            <h3 className="font-display">Delion Farm · Gloria F1 cabbage</h3>
            <p className="text-muted mb-0">
              Buyers see the variety, harvest date, available quantity, Grade A
              expectation, verified crop records, price table and a protected
              inquiry form. Mary&apos;s phone stays hidden unless she enables
              it.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-soft"
                onClick={onPreview}
              >
                <Eye /> Preview buyer view
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={onQr}
              >
                <QrCode /> Get QR code
              </button>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="gm-qr mx-auto">
              <QrCode />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioDrawer({
  portfolio,
  onShare,
  onQr,
  onSettings,
}: {
  portfolio: Portfolio;
  onShare: () => void;
  onQr: () => void;
  onSettings: () => void;
}) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-mega-icon">
          <Sprout />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">{portfolio.id}</span>
          <h3 className="font-display mb-1">
            {portfolio.crop} · {portfolio.variety}
          </h3>
          <p className="mb-0 text-muted">
            {portfolio.plot} · {portfolio.harvest}
          </p>
        </div>
        <StatusChip
          label={portfolio.state}
          tone={portfolio.state === "Live" ? "low" : "medium"}
        />
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <PackageCheck />
          <small>Available</small>
          <strong className="font-display">
            {portfolio.available.toLocaleString()} {portfolio.unit}
          </strong>
        </span>
        <span>
          <Star />
          <small>Grade A</small>
          <strong>{portfolio.gradeA}% expected</strong>
        </span>
        <span>
          <CircleDollarSign />
          <small>Starting price</small>
          <strong className="font-display">{kes(portfolio.price)}</strong>
        </span>
        <span>
          <Eye />
          <small>Buyer views</small>
          <strong>{portfolio.linkViews}</strong>
        </span>
      </div>
      <div className="gm-check-row mt-3">
        <ShieldCheck />
        <span>
          <strong>Portfolio keeps farmer contact protected</strong>
          <small>
            Buyers send inquiries through GrowMO; phone sharing stays under
            Mary&apos;s control.
          </small>
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={onSettings}
        >
          Privacy settings
        </button>
        <button type="button" className="gm-btn gm-btn-outline" onClick={onQr}>
          <QrCode /> QR code
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onShare}>
          <Share2 /> Share link
        </button>
      </div>
    </div>
  );
}

function InquiryDrawer({
  inquiry,
  buyer,
  onAction,
}: {
  inquiry: Inquiry;
  buyer: Buyer | null;
  onAction: (next: OrdersModalId) => void;
}) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-mega-icon">
          <MessageCircle />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">
            {inquiry.status} · {inquiry.received}
          </span>
          <h3 className="font-display mb-1">
            {inquiry.buyer} · {inquiry.quantity.toLocaleString()} {inquiry.unit}
          </h3>
          <p className="mb-0 text-muted">
            {inquiry.grade} · {kes(inquiry.proposedPrice)} each ·{" "}
            {inquiry.delivery}
          </p>
        </div>
        <StatusChip label={inquiry.status} tone={inquiryTone(inquiry.status)} />
      </div>
      <div className="gm-check-row mt-3">
        <MessageCircle />
        <span>
          <strong>Buyer says</strong>
          <small>“{inquiry.note}”</small>
        </span>
      </div>
      {buyer ? (
        <div className="gm-check-row mt-2">
          <Users />
          <span>
            <strong>
              {buyer.company} · {buyer.rating}
            </strong>
            <small>
              {buyer.paymentHistory} · {buyer.crops} · {buyer.location}
            </small>
          </span>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={() => onAction("buyer-profile")}
          >
            Profile
          </button>
        </div>
      ) : null}
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={() => onAction("modify-quantity")}
        >
          Quantity
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={() => onAction("modify-date")}
        >
          Date
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={() => onAction("modify-delivery")}
        >
          Delivery
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => onAction("counter-offer")}
        >
          Counter price
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          onClick={() => onAction("decline-offer")}
        >
          Decline
        </button>
      </div>
      <DashboardSectionHeader
        eyebrow="Protected chat"
        title="Negotiation thread"
      />
      <div className="gm-check-list">
        {NEGOTIATION_THREAD.map((message) => (
          <div className="gm-check-row" key={message.id}>
            <MessageCircle />
            <span>
              <strong>
                {message.from} · {message.at}
              </strong>
              <small>{message.text}</small>
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="gm-btn gm-btn-soft gm-btn-sm mt-3"
        onClick={() => onAction("thread-history")}
      >
        Open full history
      </button>
    </div>
  );
}

function OrderDrawer({
  order,
  onAction,
}: {
  order: FarmOrder;
  onAction: (next: OrdersModalId) => void;
}) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-mega-icon">
          <ShoppingBasket />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">{order.id}</span>
          <h3 className="font-display mb-1">{order.buyer}</h3>
          <p className="mb-0 text-muted">
            {order.quantity.toLocaleString()} {order.unit} · {order.crop} ·{" "}
            {order.deliveryDate}
          </p>
        </div>
        <StatusChip label={order.status} tone={orderTone(order.status)} />
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <CircleDollarSign />
          <small>Order total</small>
          <strong className="font-display">{kes(order.total)}</strong>
        </span>
        <span>
          <HandCoins />
          <small>Payment</small>
          <strong>{order.payment}</strong>
        </span>
        <span>
          <CalendarDays />
          <small>Handover</small>
          <strong>{order.delivery}</strong>
        </span>
        <span>
          <ShieldCheck />
          <small>Detail</small>
          <strong>{order.paymentDetail}</strong>
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={() => onAction("generate-contract")}
        >
          Contract
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => onAction("schedule-delivery")}
        >
          Delivery plan
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-mpesa"
          onClick={() =>
            onAction(
              order.payment === "Deposit received"
                ? "confirm-payment"
                : "collect-deposit",
            )
          }
        >
          M-Pesa
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          onClick={() => onAction("cancel-order")}
        >
          Cancel order
        </button>
      </div>
    </div>
  );
}

function BuyerDrawer({ buyer, onRate }: { buyer: Buyer; onRate: () => void }) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-mega-icon">
          <Users />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">
            {buyer.id} · {buyer.verified ? "Verified buyer" : "Profile review"}
          </span>
          <h3 className="font-display mb-1">{buyer.name}</h3>
          <p className="mb-0 text-muted">
            {buyer.company} · {buyer.phone} · {buyer.location}
          </p>
        </div>
        <StatusChip label={buyer.rating} tone="low" />
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <ShoppingBasket />
          <small>Orders</small>
          <strong>{buyer.orders}</strong>
        </span>
        <span>
          <CircleDollarSign />
          <small>Total spent</small>
          <strong className="font-display">{kes(buyer.totalSpent)}</strong>
        </span>
        <span>
          <CalendarDays />
          <small>Last order</small>
          <strong>{buyer.lastOrder}</strong>
        </span>
        <span>
          <ShieldCheck />
          <small>Payment</small>
          <strong>{buyer.paymentHistory}</strong>
        </span>
      </div>
      <div className="gm-check-row mt-3">
        <Pencil />
        <span>
          <strong>Private farmer note</strong>
          <small>{buyer.notes}</small>
        </span>
      </div>
      <button
        type="button"
        className="gm-btn gm-btn-soft mt-3"
        onClick={onRate}
      >
        <Star /> Rate buyer
      </button>
    </div>
  );
}
