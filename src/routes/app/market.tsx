/* ============================================================================
   PAGE 10 — MARKET & SALES (ENHANCED)  (/app/market)

   Blueprint sections implemented:
   10.1 Live Market Prices Dashboard   10.2 Price Trend Charts
   10.3 Best Market Recommendation     10.4 Buyer Directory
   10.5 Harvest Sales Planner          10.6 Sales Recording
   10.7 Contract Farming Board

   Plus: Crop Portfolio, Price Alerts, Bulk Orders, Export.
   15+ modals, wizards and drawers. Zero dead controls.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  Download,
  Eye,
  FileText,
  Globe,
  Handshake,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Star,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  BuyerCard,
  MarketBarChart,
  RecommendationRow,
  ScenarioRow,
  Sparkline,
  TrendBadge,
  ListingCard,
} from "../../components/app/MarketWidgets";
import {
  BulkOrderWizard,
  BuyerProfileDrawer,
  BuyerRatingDialog,
  ContractApplicationWizard,
  ContractDetailDialog,
  CreateListingWizard,
  ListingDetailDrawer,
  MarketComparisonDialog,
  NegotiationDialog,
  NewSaleWizard,
  PriceAlertDialog,
  PriceAlertListDialog,
  PriceTrendDrawer,
  SaleDetailDrawer,
  SalesExportDialog,
  SharePortfolioDialog,
  ShipmentDrawer,
} from "../../components/app/MarketModals";
import { Pagination, Reveal } from "../../components/ui/primitives";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  BUYERS,
  type Buyer,
  CROP_LISTINGS,
  type CropListing,
  FARM_CONTRACTS,
  type FarmContract,
  MARKET_PRICES,
  type MarketPriceRow,
  MARKET_RECOMMENDATIONS,
  PRICE_ALERTS,
  type PriceAlert,
  PRICE_TRENDS,
  type PriceTrend,
  SALE_SCENARIOS,
  SALES_RECORDS,
  type SaleRecord,
  formatPrice,
  contractStatusTone,
  saleStatusTone,
} from "../../data/app/market";

export const Route = createFileRoute("/app/market")({
  component: MarketSalesPage,
});

type MarketView =
  | "prices"
  | "trends"
  | "recommendations"
  | "buyers"
  | "planner"
  | "sales"
  | "contracts"
  | "portfolio"
  | "alerts";

type ModalId =
  | "listing-create"
  | "contract-apply"
  | "contract-detail"
  | "new-sale"
  | "price-alert-add"
  | "price-alert-list"
  | "market-compare"
  | "negotiate"
  | "bulk-order"
  | "sale-export"
  | "buyer-rate"
  | null;

function MarketSalesPage() {
  const [view, setView] = useState<MarketView>("prices");
  const [modal, setModal] = useState<ModalId>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [buyerDrawerOpen, setBuyerDrawerOpen] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<PriceTrend | null>(null);
  const [trendDrawerOpen, setTrendDrawerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [saleDrawerOpen, setSaleDrawerOpen] = useState(false);
  const [shipmentDrawerOpen, setShipmentDrawerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<FarmContract | null>(null);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [listingDrawerOpen, setListingDrawerOpen] = useState(false);
  const [shareDialogListing, setShareDialogListing] = useState<CropListing | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const [alerts, setAlerts] = useState<PriceAlert[]>(PRICE_ALERTS);
  const [contracts, setContracts] = useState<FarmContract[]>(FARM_CONTRACTS);
  const [listings, setListings] = useState<CropListing[]>(CROP_LISTINGS);
  const [sales, setSales] = useState<SaleRecord[]>(SALES_RECORDS);

  const openModal = (id: Exclude<ModalId, null>) => setModal(id);
  const closeModal = () => setModal(null);

  const navItems: { id: MarketView; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "prices", label: "Live Prices", icon: <TrendingUp /> },
    { id: "trends", label: "Trends", icon: <BarChart3 /> },
    { id: "recommendations", label: "Best Market", icon: <MapPin /> },
    { id: "buyers", label: "Buyers", icon: <Handshake />, count: BUYERS.length },
    { id: "planner", label: "Sales Planner", icon: <Wallet /> },
    { id: "sales", label: "Sales Log", icon: <FileText />, count: sales.length },
    { id: "contracts", label: "Contracts", icon: <ShieldCheck />, count: contracts.filter((c) => c.status === "Open").length },
    { id: "portfolio", label: "Portfolio", icon: <Package />, count: listings.filter((l) => l.status === "Active").length },
    { id: "alerts", label: "Alerts", icon: <Bell />, count: alerts.filter((a) => a.active).length },
  ];

  const totalRevenue = sales.filter((s) => s.saleStatus === "Completed").reduce((sum, s) => sum + s.netIncome, 0);
  const pendingSales = sales.filter((s) => s.saleStatus === "Pending" || s.saleStatus === "In Transit").length;
  const activeBuyers = BUYERS.filter((b) => b.totalOrders > 0).length;

  return (
    <main className="gm-app-page gm-market-page">
      <div className="gm-container py-4">
        {/* Breadcrumb */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Link to="/app/dashboard" className="gm-back-link">
            <ArrowRight className="rotate-180" /> Dashboard
          </Link>
          <span className="gm-breadcrumb-sep">/</span>
          <span className="text-muted">Sell</span>
          <span className="gm-breadcrumb-sep">/</span>
          <strong>Market & Sales</strong>
        </div>

        {/* Header card */}
        <div className="gm-card gm-market-header p-4 mb-3">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <span className="gm-eyebrow"><span className="dot" /> Market & Sales</span>
              <h2 className="gm-h-section mb-1">Sell smart — from prices to payments</h2>
              <p className="gm-lead mb-0">
                Live prices from 8 markets, buyer directory, contract farming and your crop portfolio — all in one place.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="gm-btn gm-btn-lime" onClick={() => openModal("new-sale")}>
                <Plus /> Record sale
              </button>
              <button type="button" className="gm-btn gm-btn-soft" onClick={() => openModal("listing-create")}>
                <Package /> New listing
              </button>
            </div>
          </div>
          <div className="gm-stat-grid mt-3">
            <DashboardMetric icon={Wallet} label="Sales revenue" value={formatPrice(totalRevenue)} note="From completed sales" />
            <DashboardMetric icon={Package} label="Pending sales" value={`${pendingSales}`} note="In transit or awaiting payment" />
            <DashboardMetric icon={Handshake} label="Active buyers" value={`${activeBuyers}`} note="Have placed orders" />
            <DashboardMetric icon={ShieldCheck} label="Open contracts" value={`${contracts.filter((c) => c.status === "Open").length}`} note="Available to apply" />
          </div>
        </div>

        {/* Subtabs */}
        <div className="gm-card p-2 mb-3">
          <PlannerSubtabs
            value={view}
            items={navItems}
            onChange={setView}
            label="Market & sales sections"
          />
        </div>

        <Reveal>
          {/* ═══ 10.1 LIVE MARKET PRICES ═══ */}
          {view === "prices" && (
            <PricesView
              prices={MARKET_PRICES}
              onCompare={() => openModal("market-compare")}
              onAlert={() => openModal("price-alert-list")}
            />
          )}

          {/* ═══ 10.2 PRICE TRENDS ═══ */}
          {view === "trends" && (
            <TrendsView
              trends={PRICE_TRENDS}
              onOpen={(t) => { setSelectedTrend(t); setTrendDrawerOpen(true); }}
            />
          )}

          {/* ═══ 10.3 BEST MARKET RECOMMENDATIONS ═══ */}
          {view === "recommendations" && (
            <RecommendationsView
              recs={MARKET_RECOMMENDATIONS}
              onOpen={(rec) => {
                setSelectedTrend(PRICE_TRENDS.find((t) => t.crop === "Cabbage") ?? null);
                setTrendDrawerOpen(true);
              }}
              onCompare={() => openModal("market-compare")}
            />
          )}

          {/* ═══ 10.4 BUYER DIRECTORY ═══ */}
          {view === "buyers" && (
            <BuyersView
              buyers={BUYERS}
              onView={(b) => { setSelectedBuyer(b); setBuyerDrawerOpen(true); }}
              onContact={(b) => { setSelectedBuyer(b); openModal("negotiate"); }}
              onRate={(b) => { setSelectedBuyer(b); openModal("buyer-rate"); }}
            />
          )}

          {/* ═══ 10.5 HARVEST SALES PLANNER ═══ */}
          {view === "planner" && (
            <PlannerView
              scenarios={SALE_SCENARIOS}
              onOpenScenario={(sc) => {
                setSelectedTrend(PRICE_TRENDS.find((t) => t.crop === "Cabbage") ?? null);
                setTrendDrawerOpen(true);
              }}
              onRecordSale={() => openModal("new-sale")}
            />
          )}

          {/* ═══ 10.6 SALES RECORDING ═══ */}
          {view === "sales" && (
            <SalesView
              sales={sales}
              onCreate={() => openModal("new-sale")}
              onExport={() => openModal("sale-export")}
              onView={(s) => { setSelectedSale(s); setSaleDrawerOpen(true); }}
              onTrack={(s) => { setSelectedSale(s); setShipmentDrawerOpen(true); }}
            />
          )}

          {/* ═══ 10.7 CONTRACT FARMING ═══ */}
          {view === "contracts" && (
            <ContractsView
              contracts={contracts}
              onOpen={(c) => { setSelectedContract(c); openModal("contract-detail"); }}
              onApply={(c) => { setSelectedContract(c); openModal("contract-apply"); }}
            />
          )}

          {/* ═══ PORTFOLIO ═══ */}
          {view === "portfolio" && (
            <PortfolioView
              listings={listings}
              onCreate={() => openModal("listing-create")}
              onShare={(l) => { setShareDialogListing(l); setShareDialogOpen(true); }}
              onView={(l) => { setSelectedListing(l); setListingDrawerOpen(true); }}
            />
          )}

          {/* ═══ ALERTS ═══ */}
          {view === "alerts" && (
            <AlertsView
              alerts={alerts}
              onAdd={() => openModal("price-alert-add")}
              onDelete={(id) => setAlerts((a) => a.filter((x) => x.id !== id))}
              onViewAll={() => openModal("price-alert-list")}
            />
          )}
        </Reveal>
      </div>

      {/* ═══ MODALS, WIZARDS & DRAWERS ═══ */}
      <CreateListingWizard
        open={modal === "listing-create"}
        onClose={closeModal}
        onSave={(listing) => {
          const newListing: CropListing = {
            id: `cl-new-${Date.now()}`,
            crop: listing.crop,
            variety: "Standard",
            plot: "Plot 1",
            acreage: "0.5 acre",
            expectedHarvest: "Jan 2027",
            estimatedQuantity: listing.quantity,
            unit: "heads",
            qualityGrade: "A",
            minOrder: 100,
            priceAsk: listing.price,
            photos: 0,
            views: 0,
            orders: 0,
            status: "Active",
            shareLink: `growmo.ke/p/mary/${listing.crop.toLowerCase()}-new`,
          };
          setListings((ls) => [newListing, ...ls]);
        }}
      />
      <ContractApplicationWizard
        open={modal === "contract-apply"}
        contract={selectedContract}
        onClose={closeModal}
        onApply={() => {
          if (selectedContract) {
            setContracts((cs) =>
              cs.map((c) => (c.id === selectedContract.id ? { ...c, status: "Applied" as const } : c)),
            );
          }
        }}
      />
      <ContractDetailDialog
        open={modal === "contract-detail"}
        contract={selectedContract}
        onClose={closeModal}
        onApply={() => { closeModal(); setTimeout(() => openModal("contract-apply"), 200); }}
      />
      <NewSaleWizard
        open={modal === "new-sale"}
        onClose={closeModal}
        onSave={(sale) => {
          const newSale: SaleRecord = {
            id: `sr-new-${Date.now()}`,
            date: "13 Nov 2026",
            crop: sale.crop ?? "Cabbage",
            variety: "Gloria F1",
            quantity: sale.quantity ?? 0,
            unit: "heads",
            pricePerUnit: sale.pricePerUnit ?? 0,
            totalAmount: sale.totalAmount ?? 0,
            buyer: sale.buyer ?? "Buyer",
            buyerPhone: "0712 000 000",
            paymentMethod: sale.paymentMethod ?? "M-Pesa",
            mpesaReceipt: null,
            saleStatus: "Completed",
            transportCost: 0,
            marketFees: 0,
            netIncome: sale.totalAmount ?? 0,
            qualityGrade: "A",
            notes: "New sale recorded.",
            market: "Direct",
          };
          setSales((ss) => [newSale, ...ss]);
        }}
      />
      <PriceAlertDialog
        open={modal === "price-alert-add"}
        onClose={closeModal}
        onSave={(alert) => {
          const newAlert: PriceAlert = {
            id: `pa-new-${Date.now()}`,
            crop: alert.crop ?? "Cabbage",
            market: alert.market ?? "Marikiti",
            condition: alert.condition ?? "above",
            threshold: alert.threshold ?? 0,
            currentPrice: 0,
            active: true,
            createdAt: "13 Nov 2026",
            triggeredAt: null,
          };
          setAlerts((aa) => [newAlert, ...aa]);
        }}
      />
      <PriceAlertListDialog
        open={modal === "price-alert-list"}
        alerts={alerts}
        onClose={closeModal}
        onAdd={() => { closeModal(); setTimeout(() => openModal("price-alert-add"), 200); }}
        onDelete={(id) => setAlerts((aa) => aa.filter((a) => a.id !== id))}
      />
      <MarketComparisonDialog open={modal === "market-compare"} crop="Cabbage" onClose={closeModal} />
      <NegotiationDialog
        open={modal === "negotiate"}
        buyer={selectedBuyer}
        onClose={closeModal}
        onSend={() => {}}
      />
      <BulkOrderWizard
        open={modal === "bulk-order"}
        onClose={closeModal}
        onSend={() => {}}
      />
      <SalesExportDialog
        open={modal === "sale-export"}
        onClose={closeModal}
        onExport={() => {}}
      />
      <BuyerRatingDialog
        open={modal === "buyer-rate"}
        buyer={selectedBuyer}
        onClose={closeModal}
        onSave={() => {}}
      />
      <BuyerProfileDrawer
        open={buyerDrawerOpen}
        buyer={selectedBuyer}
        onClose={() => setBuyerDrawerOpen(false)}
        onOrder={() => { setBuyerDrawerOpen(false); openModal("bulk-order"); }}
      />
      <PriceTrendDrawer
        open={trendDrawerOpen}
        trend={selectedTrend}
        onClose={() => setTrendDrawerOpen(false)}
      />
      <SaleDetailDrawer
        open={saleDrawerOpen}
        sale={selectedSale}
        onClose={() => setSaleDrawerOpen(false)}
        onTrack={() => { setSaleDrawerOpen(false); setSelectedSale(selectedSale); setShipmentDrawerOpen(true); }}
      />
      <ShipmentDrawer
        open={shipmentDrawerOpen}
        sale={selectedSale}
        onClose={() => setShipmentDrawerOpen(false)}
      />
      <SharePortfolioDialog
        open={shareDialogOpen}
        listing={shareDialogListing}
        onClose={() => setShareDialogOpen(false)}
      />
      <ListingDetailDrawer
        open={listingDrawerOpen}
        listing={selectedListing}
        onClose={() => setListingDrawerOpen(false)}
        onShare={() => { setListingDrawerOpen(false); setShareDialogListing(selectedListing); setTimeout(() => setShareDialogOpen(true), 200); }}
      />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 10.1 Prices ─────────────────────────────────────────────────────────── */
function PricesView({
  prices,
  onCompare,
  onAlert,
}: {
  prices: MarketPriceRow[];
  onCompare: () => void;
  onAlert: () => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = prices.filter((p) =>
    `${p.crop} ${p.swahili}`.toLowerCase().includes(query.toLowerCase()),
  );
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.1 · Live market prices"
        title="What are buyers paying today?"
        subtitle="Real-time prices from 8 major Kenyan markets — updated every morning. Prices are in KES."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onAlert}>
              <Bell /> Price alerts
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onCompare}>
              <BarChart3 /> Compare markets
            </button>
          </div>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <div className="gm-search-wrap" style={{ flex: "1 1 260px" }}>
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search crop name..."
            />
          </div>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => { setQuery(""); setPage(1); }}>
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Unit</th>
                <th>Marikiti</th>
                <th>Wakulima</th>
                <th>Kangemi</th>
                <th>Kongowea</th>
                <th>Eldoret</th>
                <th>Thika</th>
                <th>Trend</th>
                <th>Best</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.crop}</strong>
                    <small className="d-block text-muted">{p.swahili}</small>
                  </td>
                  <td><small>{p.unit}</small></td>
                  <td><strong className="font-display">{p.marikiti}</strong></td>
                  <td>{p.wakulima}</td>
                  <td>{p.kangemi}</td>
                  <td>{p.kongowea}</td>
                  <td>{p.eldoret}</td>
                  <td>{p.thika}</td>
                  <td><TrendBadge trend={p.trend} /></td>
                  <td><span className="gm-chip">{p.bestMarket}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="text-muted text-center py-4 mb-0">No crop matches that search.</p>
        )}
        <Pagination page={Math.min(page, totalPages)} total={totalPages} onChange={setPage} perPage={perPage} totalItems={filtered.length} />
      </div>
      <div className="row g-3 mt-1">
        {prices.slice(0, 3).map((p) => (
          <div className="col-xl-4" key={p.id}>
            <div className="gm-card p-3 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong style={{ fontSize: "1rem" }}>{p.crop}</strong>
                  <small className="d-block text-muted">{p.swahili} · {p.unit}</small>
                </div>
                <TrendBadge trend={p.trend} />
              </div>
              <p className="text-muted mb-2" style={{ fontSize: "0.84rem" }}>{p.advice}</p>
              <div className="gm-check-row">
                <MapPin />
                <span>
                  <strong>Best market: {p.bestMarket}</strong>
                  <small>Updated {p.lastUpdate}</small>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 10.2 Trends ─────────────────────────────────────────────────────────── */
function TrendsView({
  trends,
  onOpen,
}: {
  trends: PriceTrend[];
  onOpen: (t: PriceTrend) => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.2 · Price trends"
        title="See where prices are heading"
        subtitle="7-day and 30-day sparklines plus seasonal patterns help you time your sales."
      />
      <div className="row g-3 mt-1">
        {trends.map((t) => {
          const pctChange = t.weekAgo > 0 ? ((t.current - t.weekAgo) / t.weekAgo) * 100 : 0;
          return (
            <div className="col-xl-6" key={t.id}>
              <button type="button" className="gm-card p-3 h-100 text-start w-100" style={{ cursor: "pointer" }} onClick={() => onOpen(t)}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong style={{ fontSize: "1rem" }}>{t.crop} — {t.market}</strong>
                    <small className="d-block text-muted">{t.unit}</small>
                  </div>
                  <TrendBadge trend={t.trend} />
                </div>
                <div className="d-flex align-items-end justify-content-between gap-3">
                  <div>
                    <h3 className="font-display mb-0" style={{ fontSize: "1.6rem" }}>{formatPrice(t.current)}</h3>
                    <small className={pctChange >= 0 ? "text-success" : "text-danger"} style={{ fontWeight: 700 }}>
                      {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% vs 7 days ago
                    </small>
                  </div>
                  <Sparkline data={t.data7d} width={140} height={44} color={t.trend === "up" ? "var(--gm-leaf-500)" : t.trend === "down" ? "var(--gm-clay-500)" : "var(--gm-ink-400)"} />
                </div>
                <p className="text-muted mb-0 mt-2" style={{ fontSize: "0.82rem" }}>{t.insight}</p>
                <div className="d-flex gap-2 mt-2">
                  <span className="gm-chip">Peak: {t.seasonPeak}</span>
                  <span className="gm-chip">Low: {t.seasonLow}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── 10.3 Recommendations ────────────────────────────────────────────────── */
function RecommendationsView({
  recs,
  onOpen,
  onCompare,
}: {
  recs: typeof MARKET_RECOMMENDATIONS;
  onOpen: (rec: typeof MARKET_RECOMMENDATIONS[0]) => void;
  onCompare: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.3 · Best market recommendation"
        title="Where should you sell?"
        subtitle="AI ranks markets by net price after transport, distance and buyer reliability."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onCompare}>
            <BarChart3 /> Full comparison
          </button>
        }
      />
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">Cabbage · 14,500 heads · from Githunguri, Kiambu</span>
        <h3 className="font-display mb-3">Market ranking by net price per head</h3>
        {recs.map((rec) => (
          <RecommendationRow key={rec.rank} rec={rec} onOpen={() => onOpen(rec)} />
        ))}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">AI insight</span>
            <h3 className="font-display mb-2">Thika is your best net market</h3>
            <p className="text-muted">
              At only 15 km from Githunguri, Thika delivers KES 29.50/head after transport — the highest net. 
              Marikiti offers KES 35 gross but broker fees and 40 km transport erode margin to KES 33.
            </p>
            <div className="gm-check-row">
              <TrendingUp />
              <span>
                <strong>Revenue uplift</strong>
                <small>Selling at Thika vs Marikiti: +KES 14,500 on 5,000 heads</small>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <MarketBarChart
            rows={recs.map((r) => ({
              label: r.market,
              value: r.netPricePerHead,
              sub: `${r.distanceKm} km`,
              highlight: r.rank === 1,
            }))}
            formatValue={(v) => `KES ${v}`}
          />
        </div>
      </div>
    </>
  );
}

/* ── 10.4 Buyers ─────────────────────────────────────────────────────────── */
function BuyersView({
  buyers,
  onView,
  onContact,
  onRate,
}: {
  buyers: Buyer[];
  onView: (b: Buyer) => void;
  onContact: (b: Buyer) => void;
  onRate: (b: Buyer) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = buyers.filter(
    (b) =>
      `${b.name} ${b.type} ${b.crops.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
      (type === "all" || b.type === type),
  );
  const perPage = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.4 · Buyer directory"
        title="Connect with verified buyers"
        subtitle="Supermarkets, brokers, restaurants and exporters — all with ratings, terms and contact info."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onContact(buyers[0])}>
            <MessageSquare /> Message buyer
          </button>
        }
      />
      <div className="gm-filter-bar gm-card p-3 mt-3">
        <div className="gm-search-wrap">
          <Search />
          <input className="gm-input" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search buyer, crop or location" />
        </div>
        <select className="gm-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="all">All buyer types</option>
          <option>Broker</option><option>Supermarket</option><option>Restaurant</option>
          <option>Exporter</option><option>Online</option><option>Cooperative</option><option>Direct</option>
        </select>
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => { setQuery(""); setType("all"); setPage(1); }}>
          <RefreshCw /> Reset
        </button>
      </div>
      <div className="row g-3 mt-1">
        {visible.map((b) => (
          <div className="col-xl-6" key={b.id}>
            <BuyerCard
              buyer={b}
              onView={() => onView(b)}
              onContact={() => onContact(b)}
            />
          </div>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="gm-card p-4 mt-3 text-center">
          <p className="text-muted mb-0">No buyer matches that search.</p>
        </div>
      )}
      <Pagination page={Math.min(page, totalPages)} total={totalPages} onChange={setPage} perPage={perPage} totalItems={filtered.length} />
    </>
  );
}

/* ── 10.5 Planner ────────────────────────────────────────────────────────── */
function PlannerView({
  scenarios,
  onOpenScenario,
  onRecordSale,
}: {
  scenarios: typeof SALE_SCENARIOS;
  onOpenScenario: (sc: typeof SALE_SCENARIOS[0]) => void;
  onRecordSale: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.5 · Harvest sales planner"
        title="Compare sale strategies before you sell"
        subtitle="See how selling direct, via broker, or storing for peak price changes your net revenue."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onRecordSale}>
            <Plus /> Record a sale
          </button>
        }
      />
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">Cabbage Gloria F1 · 0.5 acre · 14,500 heads expected</span>
        <h3 className="font-display mb-2">Which scenario earns the most?</h3>
        {scenarios.map((sc) => (
          <ScenarioRow key={sc.id} scenario={sc} onOpen={() => onOpenScenario(sc)} />
        ))}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">AI recommendation</span>
            <h3 className="font-display mb-2">Store 2 weeks, then sell at peak</h3>
            <p className="text-muted">
              January cabbage prices typically hit KES 40/head in Kiambu and Nairobi. 
              With proper cold storage or a shaded granary, you can hold 14,500 heads for 2 weeks 
              and gain +KES 143,550 over immediate Marikiti sale.
            </p>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Risk: spoilage</strong>
                <small>Keep loss below 3% with clean stacking, airflow and no ground contact.</small>
              </span>
            </div>
            <div className="gm-check-row mt-2">
              <TrendingUp />
              <span>
                <strong>Revenue uplift</strong>
                <small>+KES 143,550 vs immediate Marikiti sale (35.7% more)</small>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <MarketBarChart
            rows={scenarios.map((sc) => ({
              label: sc.label.length > 20 ? sc.label.slice(0, 20) + "…" : sc.label,
              value: sc.netRevenue,
              highlight: sc.recommended,
            }))}
          />
        </div>
      </div>
    </>
  );
}

/* ── 10.6 Sales ──────────────────────────────────────────────────────────── */
function SalesView({
  sales,
  onCreate,
  onExport,
  onView,
  onTrack,
}: {
  sales: SaleRecord[];
  onCreate: () => void;
  onExport: () => void;
  onView: (s: SaleRecord) => void;
  onTrack: (s: SaleRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = sales.filter(
    (s) =>
      `${s.crop} ${s.buyer} ${s.market} ${s.mpesaReceipt ?? ""}`.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" || s.saleStatus === status),
  );
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const totalNet = filtered.reduce((sum, s) => sum + s.netIncome, 0);

  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.6 · Sales recording"
        title="Every sale, tracked and receipted"
        subtitle="Record sales, track deliveries and export your sales ledger for accounting."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onExport}>
              <Download /> Export sales
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onCreate}>
              <Plus /> Record sale
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Wallet} label="Total net income" value={formatPrice(totalNet)} note={`${filtered.length} matching sales`} />
        <DashboardMetric icon={Check} label="Completed" value={`${sales.filter((s) => s.saleStatus === "Completed").length}`} note="Paid and delivered" />
        <DashboardMetric icon={Truck} label="In transit" value={`${sales.filter((s) => s.saleStatus === "In Transit").length}`} note="On the way to buyer" />
        <DashboardMetric icon={AlertTriangle} label="Pending" value={`${sales.filter((s) => s.saleStatus === "Pending").length}`} note="Awaiting delivery or payment" />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-wrap" style={{ flex: "1 1 260px" }}>
            <Search />
            <input className="gm-input" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search crop, buyer, market or receipt" />
          </div>
          <select className="gm-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            <option>Completed</option><option>Pending</option><option>In Transit</option><option>Forecast</option>
          </select>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => { setQuery(""); setStatus("all"); setPage(1); }}>
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date / crop</th>
                <th>Quantity</th>
                <th>Price/unit</th>
                <th>Total</th>
                <th>Net income</th>
                <th>Buyer</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.crop} {s.variety}</strong>
                    <small className="d-block text-muted">{s.date}</small>
                  </td>
                  <td>{s.quantity.toLocaleString("en-KE")} {s.unit}</td>
                  <td>{formatPrice(s.pricePerUnit)}</td>
                  <td><strong className="font-display">{formatPrice(s.totalAmount)}</strong></td>
                  <td><strong className="font-display" style={{ color: "var(--gm-leaf-700)" }}>{formatPrice(s.netIncome)}</strong></td>
                  <td>
                    <strong>{s.buyer}</strong>
                    <small className="d-block text-muted">{s.market}</small>
                  </td>
                  <td><StatusChip label={s.saleStatus} tone={saleStatusTone(s.saleStatus)} /></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button type="button" className="gm-icon-btn" onClick={() => onView(s)}><Eye /></button>
                      {(s.saleStatus === "In Transit" || s.saleStatus === "Pending") && (
                        <button type="button" className="gm-icon-btn" onClick={() => onTrack(s)}><Truck /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="text-muted text-center py-4 mb-0">No sale matches.</p>}
        <Pagination page={Math.min(page, totalPages)} total={totalPages} onChange={setPage} perPage={perPage} totalItems={filtered.length} />
      </div>
    </>
  );
}

/* ── 10.7 Contracts ──────────────────────────────────────────────────────── */
function ContractsView({
  contracts,
  onOpen,
  onApply,
}: {
  contracts: FarmContract[];
  onOpen: (c: FarmContract) => void;
  onApply: (c: FarmContract) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = contracts.filter((c) =>
    `${c.company} ${c.crop} ${c.variety}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <DashboardSectionHeader
        eyebrow="10.7 · Contract farming"
        title="Guaranteed prices, long-term buyers"
        subtitle="Apply for contracts from exporters, processors and supermarkets — with price guarantees and transparent terms."
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <div className="gm-search-wrap" style={{ flex: "1 1 260px" }}>
            <Search />
            <input className="gm-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company or crop" />
          </div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Crop</th>
                <th>Acreage</th>
                <th>Duration</th>
                <th>Price guarantee</th>
                <th>Deadline</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.company}</strong>
                    <small className="d-block text-muted">{c.location}</small>
                  </td>
                  <td><strong>{c.crop}</strong><small className="d-block text-muted">{c.variety}</small></td>
                  <td>{c.acreage}</td>
                  <td>{c.duration}</td>
                  <td><strong className="font-display">{c.priceGuarantee}</strong></td>
                  <td>{c.applicationDeadline}</td>
                  <td><StatusChip label={c.status} tone={contractStatusTone(c.status)} /></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button type="button" className="gm-icon-btn" onClick={() => onOpen(c)}><Eye /></button>
                      {c.status === "Open" && (
                        <button type="button" className="gm-icon-btn" onClick={() => onApply(c)}><Handshake /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-muted text-center py-4 mb-0">No contract matches.</p>}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Why contract farming?</span>
            <h3 className="font-display mb-2">Price certainty before you plant</h3>
            <p className="text-muted">
              Contract farming locks in a buyer and price before planting. GrowMO tracks your compliance 
              (spray records, quality grades) so you meet export and supermarket standards.
            </p>
            <div className="gm-check-row">
              <ShieldCheck />
              <span><strong>Guaranteed market</strong><small>No broker middlemen — direct company terms.</small></span>
            </div>
            <div className="gm-check-row mt-2">
              <TrendingUp />
              <span><strong>Premium pricing</strong><small>Export contracts pay 15–25% above local market.</small></span>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Your readiness</span>
            <h3 className="font-display mb-2">What you need to apply</h3>
            <div className="gm-check-row">
              <Check />
              <span><strong>Farm registered</strong><small>County registration complete.</small></span>
            </div>
            <div className="gm-check-row mt-2">
              <Check />
              <span><strong>Spray diary active</strong><small>3 spray records this season.</small></span>
            </div>
            <div className="gm-check-row mt-2">
              <AlertTriangle />
              <span><strong>GlobalG.A.P — not started</strong><small>Required for export contracts.</small></span>
            </div>
            <div className="gm-check-row mt-2">
              <Check />
              <span><strong>PCPB certificate</strong><small>Valid until Oct 2027.</small></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Portfolio ───────────────────────────────────────────────────────────── */
function PortfolioView({
  listings,
  onCreate,
  onShare,
  onView,
}: {
  listings: CropListing[];
  onCreate: () => void;
  onShare: (l: CropListing) => void;
  onView: (l: CropListing) => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="Crop portfolio"
        title="Your standing crops — visible to buyers"
        subtitle="Share your portfolio link on WhatsApp. Buyers can view photos, grades and expected harvest dates."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onCreate}>
            <Plus /> Create listing
          </button>
        }
      />
      <div className="row g-3 mt-1">
        {listings.map((l) => (
          <div className="col-xl-6" key={l.id}>
            <ListingCard listing={l} onShare={() => onShare(l)} onView={() => onView(l)} />
          </div>
        ))}
      </div>
      <div className="gm-card p-4 mt-3">
        <span className="gm-eyebrow">Portfolio stats</span>
        <h3 className="font-display mb-2">How buyers find you</h3>
        <div className="gm-stat-grid">
          <DashboardMetric icon={Globe} label="Total views" value={`${listings.reduce((s, l) => s + l.views, 0)}`} note="Across all listings" />
          <DashboardMetric icon={Package} label="Active listings" value={`${listings.filter((l) => l.status === "Active").length}`} note="Visible to buyers" />
          <DashboardMetric icon={Handshake} label="Orders received" value={`${listings.reduce((s, l) => s + l.orders, 0)}`} note="From portfolio" />
        </div>
      </div>
    </>
  );
}

/* ── Alerts ──────────────────────────────────────────────────────────────── */
function AlertsView({
  alerts,
  onAdd,
  onDelete,
  onViewAll,
}: {
  alerts: PriceAlert[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="Price alerts"
        title="Never miss a good price"
        subtitle="Set alerts for crops and markets — get notified when prices cross your target."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onAdd}>
            <Plus /> Add alert
          </button>
        }
      />
      <div className="row g-3 mt-1">
        {alerts.map((a) => (
          <div className="col-xl-6" key={a.id}>
            <div className="gm-card p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong style={{ fontSize: "1rem" }}>{a.crop} — {a.market}</strong>
                  <small className="d-block text-muted">Alert when {a.condition} {formatPrice(a.threshold)}</small>
                </div>
                <StatusChip label={a.active ? "Active" : "Triggered"} tone={a.active ? "low" : "medium"} />
              </div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div>
                  <small style={{ color: "var(--gm-ink-400)" }}>Current</small>
                  <strong className="font-display d-block">{formatPrice(a.currentPrice)}</strong>
                </div>
                <div>
                  <small style={{ color: "var(--gm-ink-400)" }}>Target</small>
                  <strong className="font-display d-block">{formatPrice(a.threshold)}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="gm-progress"><i style={{ width: `${Math.min(100, (a.currentPrice / a.threshold) * 100)}%` }} /></div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onDelete(a.id)}>
                  <X width={14} height={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {alerts.length === 0 && (
        <div className="gm-empty mt-3">
          <h4 className="font-display">No alerts set</h4>
          <p className="text-muted">Create your first price alert to get started.</p>
          <button type="button" className="gm-btn gm-btn-lime" onClick={onAdd}>
            <Plus /> Add alert
          </button>
        </div>
      )}
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">How alerts work</span>
        <h3 className="font-display mb-2">Set it and forget it</h3>
        <div className="row g-2">
          <div className="col-md-4">
            <div className="gm-check-row">
              <Bell />
              <span><strong>1. Set a target</strong><small>Pick crop, market and price threshold.</small></span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="gm-check-row">
              <TrendingUp />
              <span><strong>2. GrowMO watches</strong><small>Daily price updates from 30+ markets.</small></span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="gm-check-row">
              <MessageSquare />
              <span><strong>3. Get notified</strong><small>Push, SMS or in-app when price hits.</small></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

