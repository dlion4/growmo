/* ============================================================================
   PAGE 10 — MARKET & SALES  (/app/market)

   Blueprint sections implemented:
   10.1 live market prices (8 Kenyan markets × 10 crops)
   10.2 price trend charts (7d/30d/12m/yoy/seasonal)
   10.3 AI best-market recommendation (net price after transport/cess)
   10.4 buyer directory (brokers, supermarkets, restaurants, exporters, co-ops)
   10.5 harvest sales planner (4 scenarios + AI pick)
   10.6 sales recording with M-Pesa OTP and records write-through
   10.7 contract farming board (apply wizard + eligibility checks)

   The page keeps a working sales ledger in local state: recording a sale adds
   it to the table, updates the YTD totals and writes a mock records entry;
   applying for a contract moves it to "applied"; activating a scenario books
   transport via the M-Pesa deposit flow and issues a receipt code.
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Bell,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  Download,
  FileBarChart2,
  Filter,
  HelpCircle,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Settings2,
  Share2,
  Table2,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
} from "../../components/app/DashboardWidgets";
import {
  BuyerCard,
  ContractCard,
  MarketHero,
  MarketKv,
  PriceRow,
  PriceTrendChart,
  RecommendationRow,
  SaleRow,
  ScenarioCard,
} from "../../components/app/MarketWidgets";
import {
  ActivatePlanWizard,
  ApplyContractWizard,
  ConfirmMarketDialog,
  BuyerDetailDialog,
  ContactBuyerDialog,
  ContractDetailDialog,
  CropPriceDialog,
  MarketAlertsDialog,
  MarketExportDialog,
  MarketFaqDialog,
  MarketScoreDialog,
  MarketSettingsDialog,
  MarketShareDialog,
  PriceAlertWizard,
  QuickPhoneDialog,
  RecordSaleWizard,
  RecommendationDetailDialog,
  SaleDetailDialog,
  ScenarioDetailDialog,
  TransportCompareDialog,
  TrendDialog,
  TrendPointDialog,
} from "../../components/app/MarketModals";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  BUYERS,
  CABBAGE_MARIKITI_12M,
  CABBAGE_MARKET_RECS,
  CONTRACTS,
  CROP_PRICES,
  MARKETS,
  MARKET_CONTEXT,
  PRICE_HISTORY_7D_CABBAGE,
  SALE_RECORDS,
  SALES_SCENARIOS,
  marketTotals,
  type Buyer,
  type Contract,
  type CropPriceRow,
  type MarketRecommendation,
  type SaleRecord,
  type SalesScenario,
  type TrendPoint,
} from "../../data/app/market";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

type MarketSection = "prices" | "trends" | "best" | "buyers" | "planner" | "sales" | "contracts";

type ModalId =
  | "crop-detail"
  | "trend"
  | "trend-point"
  | "alert-wizard"
  | "rec-detail"
  | "buyer-detail"
  | "buyer-contact"
  | "buyer-phone"
  | "scenario-detail"
  | "activate-plan"
  | "sale-detail"
  | "record-sale"
  | "contract-detail"
  | "apply-contract"
  | "transport"
  | "export"
  | "share"
  | "settings"
  | "faq"
  | "score"
  | "alerts"
  | "confirm-delete-sale"
  | null;

function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/app/market")({ component: MarketPage });

function MarketPage() {
  const toast = useToast();
  const totals = useMemo(() => marketTotals(), []);
  const [section, setSection] = useState<MarketSection>("prices");
  const [modal, setModal] = useState<ModalId>(null);
  const [drawer, setDrawer] = useState<"activity" | "sale-receipt" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropPriceRow | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TrendPoint | null>(null);
  const [selectedRec, setSelectedRec] = useState<MarketRecommendation | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<SalesScenario | null>(null);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "12m" | "yoy" | "seasonal">("12m");
  const [sales, setSales] = useState<SaleRecord[]>(SALE_RECORDS);
  const [contracts, setContracts] = useState(CONTRACTS);

  // List state
  const [cropQuery, setCropQuery] = useState("");
  const [buyerQuery, setBuyerQuery] = useState("");
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<string>("All");
  const [buyerPage, setBuyerPage] = useState(1);
  const [salesQuery, setSalesQuery] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState("All");
  const [salesPage, setSalesPage] = useState(1);
  const [contractQuery, setContractQuery] = useState("");
  const [contractPage, setContractPage] = useState(1);

  const buyerTypes = ["All", ...Array.from(new Set(BUYERS.map((b) => b.type)))];
  const filteredBuyers = useMemo(() => {
    const q = buyerQuery.trim().toLowerCase();
    return BUYERS.filter((b) => {
      const match = q.length === 0 || b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q) || b.cropsWanted.some((c) => c.toLowerCase().includes(q));
      const typeOk = buyerTypeFilter === "All" || b.type === buyerTypeFilter;
      return match && typeOk;
    });
  }, [buyerQuery, buyerTypeFilter]);
  const buyerPerPage = 6;
  const buyerPages = Math.max(1, Math.ceil(filteredBuyers.length / buyerPerPage));
  const buyersShown = filteredBuyers.slice((buyerPage - 1) * buyerPerPage, buyerPage * buyerPerPage);

  const filteredSales = useMemo(() => {
    const q = salesQuery.trim().toLowerCase();
    return sales.filter((s) => {
      const match = q.length === 0 || s.crop.toLowerCase().includes(q) || s.buyer.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      const stOk = salesStatusFilter === "All" || s.paymentStatus === salesStatusFilter;
      return match && stOk;
    });
  }, [sales, salesQuery, salesStatusFilter]);
  const salesPerPage = 6;
  const salesPages = Math.max(1, Math.ceil(filteredSales.length / salesPerPage));
  const salesShown = filteredSales.slice((salesPage - 1) * salesPerPage, salesPage * salesPerPage);

  const filteredContracts = useMemo(() => {
    const q = contractQuery.trim().toLowerCase();
    return contracts.filter((c) => c.title.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.crop.toLowerCase().includes(q));
  }, [contracts, contractQuery]);
  const contractPerPage = 6;
  const contractPages = Math.max(1, Math.ceil(filteredContracts.length / contractPerPage));
  const contractsShown = filteredContracts.slice((contractPage - 1) * contractPerPage, contractPage * contractPerPage);

  const filteredCrops = useMemo(() => {
    const q = cropQuery.trim().toLowerCase();
    return CROP_PRICES.filter((c) => q.length === 0 || c.crop.toLowerCase().includes(q) || c.swahili.toLowerCase().includes(q));
  }, [cropQuery]);

  const openCrop = (c: CropPriceRow) => { setSelectedCrop(c); setModal("crop-detail"); };
  const openPoint = (p: TrendPoint) => { setSelectedPoint(p); setModal("trend-point"); };

  const handleRecordSale = (partial: Partial<SaleRecord>) => {
    const rec: SaleRecord = {
      id: `sal-${String(sales.length + 1).padStart(3, "0")}`,
      date: partial.date ? new Date(partial.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-KE"),
      dateIso: partial.date ?? new Date().toISOString().slice(0, 10),
      crop: partial.crop ?? "Cabbage",
      variety: partial.variety ?? "Gloria F1",
      quantity: partial.quantity ?? 0,
      unit: partial.unit ?? "Head",
      pricePerUnit: partial.pricePerUnit ?? 0,
      totalAmount: partial.totalAmount ?? 0,
      buyer: partial.buyer ?? "",
      buyerPhone: partial.buyerPhone ?? "",
      paymentMethod: partial.paymentMethod ?? "M-Pesa",
      mpesaReceipt: partial.mpesaReceipt,
      paymentStatus: partial.paymentStatus ?? "Received",
      transportCost: partial.transportCost ?? 0,
      marketFees: partial.marketFees ?? 0,
      netIncome: partial.netIncome ?? 0,
      qualityGrade: partial.qualityGrade ?? "A",
      notes: partial.notes ?? "",
      recordedBy: "Mary Wanjiku",
      plot: partial.plot ?? "Plot 1",
    };
    setSales((s) => [rec, ...s]);
    toast.notify(`Sale recorded — ${kes(rec.netIncome)} net from ${rec.buyer}`, "success");
  };
  const handleApplyContract = (c: Contract) => {
    setContracts((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "applied" as const } : x)));
    toast.notify(`Application sent to ${c.company}`, "success");
  };

  return (
    <div className="gm-app-page">
      <MarketHero score={MARKET_CONTEXT.marketScore} ytd={totals.salesYtd} target={MARKET_CONTEXT.salesTarget} topMarket={MARKET_CONTEXT.topMarket}>
        <div className="gm-mk-toolbar" style={{ marginTop: "1.1rem" }}>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("alerts")}>
            <Bell /> Price alerts <span className="gm-chip gm-chip-gold" style={{ marginLeft: 4 }}>4</span>
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("transport")}>
            <Truck /> Transport
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("faq")}><HelpCircle /> FAQ</button>
          <div className="gm-mk-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreHorizontal /> Tools <ChevronDown />
            </button>
            {menuOpen ? (
              <div className="gm-mk-menu is-open">
                <button type="button" onClick={() => { setMenuOpen(false); setModal("export"); }}><Download /> Export sales & prices</button>
                <button type="button" onClick={() => { setMenuOpen(false); setModal("share"); }}><Share2 /> Share access link</button>
                <button type="button" onClick={() => { setMenuOpen(false); window.print(); }}><Printer /> Print this page</button>
                <button type="button" onClick={() => { setMenuOpen(false); setModal("settings"); }}><Settings2 /> Market settings</button>
                <button type="button" onClick={() => { setMenuOpen(false); setModal("faq"); }}><HelpCircle /> FAQ & glossary</button>
              </div>
            ) : null}
          </div>
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setModal("record-sale")}>
            <Plus /> Record sale
          </button>
        </div>
      </MarketHero>

      {/* Section tabs */}
      <Reveal>
        <div className="gm-subtabs" role="tablist" aria-label="Market sections">
          {[
            { id: "prices", label: "Live prices", icon: TrendingUp, count: CROP_PRICES.length },
            { id: "trends", label: "Trends", icon: TrendingUp },
            { id: "best", label: "Best market", icon: Award },
            { id: "buyers", label: "Buyer directory", icon: Building2, count: BUYERS.length },
            { id: "planner", label: "Harvest planner", icon: FileBarChart2 },
            { id: "sales", label: "Sales log", icon: Table2, count: sales.length },
            { id: "contracts", label: "Contracts", icon: CheckCircle2, count: contracts.filter((c) => c.status === "open").length },
          ].map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={section === t.id} className={`gm-subtab ${section === t.id ? "on" : ""}`} onClick={() => setSection(t.id as MarketSection)}>
              <t.icon /> {t.label}{t.count ? <span className="gm-subtab-count">{t.count}</span> : null}
            </button>
          ))}
        </div>
      </Reveal>

      {/* ==================================== 10.1 PRICES ==================================== */}
      {section === "prices" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.1 · Live Market Prices"
            title="Major Kenyan markets — real-time wholesale"
            subtitle="Indicative prices per unit at open markets this morning. KAMIS feed 09:14. Click any cell for net price after transport and cess."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => csvDownload(`market-prices-${Date.now()}.csv`, [
                  ["Crop","Unit",...MARKETS.map((m) => m.marketShort)],
                  ...CROP_PRICES.map((c) => [c.crop, c.unit, ...MARKETS.map((m) => `${c.prices[m.market]?.[0]}-${c.prices[m.market]?.[1]}`)]),
                ])}><Download /> CSV</button>
              </div>
            }
          />
          <div className="gm-mk-toolbar">
            <div className="gm-mk-search">
              <Search width={16} height={16} />
              <input className="gm-input" placeholder="Search crop or Kiswahili name…" value={cropQuery} onChange={(e) => setCropQuery(e.target.value)} />
            </div>
            <span className="gm-mk-count">🟢 Price up · 🔴 Price down · ↔ Stable</span>
          </div>
          <div className="gm-card gm-card-flush">
            <div className="gm-mk-price-table">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    {MARKETS.map((m) => (<th key={m.market}>{m.marketShort}</th>))}
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrops.map((c) => (
                    <PriceRow key={c.crop} crop={c} markets={MARKETS}
                      onCropClick={openCrop}
                      onMarketClick={(crop) => { setSelectedCrop(crop); setModal("crop-detail"); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="gm-mk-callout tone-info" style={{ marginTop: "1rem" }}>
            📡 Prices are indicative farm-gate/wholesale figures from KAMIS + cooperative reports. Actual transacted price varies by KES 2-5 depending on quality, time of day and broker relationship.
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 10.2 TRENDS ==================================== */}
      {section === "trends" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.2 · Price Trend Charts"
            title="Spot the harvest window with price history"
            subtitle="Pick a range to see when prices peak so you can time your planting and harvest."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("alert-wizard")}><Bell /> Set alert</button>
                <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setModal("trend")}><TrendingUp /> View full chart</button>
              </div>
            }
          />
          <div className="gm-tabs mb-3">
            {(["7d","30d","12m","yoy","seasonal"] as const).map((r) => (
              <button key={r} type="button" className={`gm-tab ${range === r ? "on" : ""}`} onClick={() => setRange(r)}>
                {{ "7d": "7 days", "30d": "30 days", "12m": "12 months", yoy: "Year on year", seasonal: "Seasonal" }[r]}
              </button>
            ))}
          </div>
          <div className="gm-card gm-card-flush">
            <div className="gm-mk-chart is-lg">
              <h4 style={{ padding: "1rem 1rem 0", margin: 0 }}>Cabbage at Marikiti — 12 months</h4>
              <PriceTrendChart points={CABBAGE_MARIKITI_12M} onPointClick={openPoint} />
            </div>
          </div>
          <div className="gm-card-grid-3" style={{ marginTop: "1rem" }}>
            <DashboardMetric icon={TrendingUp} label="7-day avg" value="KES 32" note="Cabbage Marikiti · +8% WoW" />
            <DashboardMetric icon={Award} label="Peak month" value="January" note="48 KES/head · dry season premium" />
            <DashboardMetric icon={Car} label="Planting window" value="Oct–Nov" note="Targets Jan peak with 10 wk maturity" />
          </div>
          <div className="gm-mk-callout tone-good" style={{ marginTop: "1rem" }}>
            💡 <strong>Insight.</strong> Cabbage prices peak Jan–Feb (dry season, low supply) and dip Jun–Aug (cool dry, some irrigated supply). Planting in Oct–Nov positions you for the January price peak. Store 2 weeks after mid-Jan harvest adds ~KES 8/head.
          </div>
          <h4 className="gm-h-section" style={{ marginTop: "2rem" }}>Last 7 days — Marikiti vs Thika vs Kangemi</h4>
          <div className="gm-card gm-card-flush">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead><tr><th>Day</th><th>Marikiti</th><th>Thika</th><th>Kangemi</th><th>Volume (heads)</th></tr></thead>
                <tbody>
                  {PRICE_HISTORY_7D_CABBAGE.map((d) => (
                    <tr key={d.day}><td><strong>{d.day}</strong></td><td>KES {d.marikiti}</td><td>KES {d.thika}</td><td>KES {d.kangemi}</td><td>{d.volume.toLocaleString("en-KE")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 10.3 BEST MARKET ==================================== */}
      {section === "best" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.3 · Best Market Recommendation"
            title="AI ranks markets by net return for your cabbage harvest"
            subtitle="Distance, wholesale price, transport cost and buyer reliability are combined to give a realistic net per head — not just the highest headline price."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("transport")}><Truck /> Transport options</button>
                <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setSection("planner")}><Award /> See planner scenarios</button>
              </div>
            }
          />
          <div className="gm-card-grid-3">
            <DashboardMetric icon={Award} label="Best net" value="KES 32.65" note="Marikiti after fees/transport" />
            <DashboardMetric icon={Truck} label="Closest" value="Thika · 15 km" note="KES 0.50/head transport" />
            <DashboardMetric icon={Building2} label="Top volume" value="Marikiti" note="10/10 · moves 14,500 heads easily" />
          </div>
          <div className="gm-mk-rec-list" style={{ marginTop: "1rem" }}>
            {CABBAGE_MARKET_RECS.map((r) => (
              <RecommendationRow key={r.market} rec={r} onOpen={(rec) => { setSelectedRec(rec); setModal("rec-detail"); }} />
            ))}
          </div>
          <div className="gm-mk-callout tone-info" style={{ marginTop: "1rem" }}>
            Calculations assume hired 1.5T lorry at KES 60/km, cooperative cess 1% where applicable, and 14,500 heads (0.5 acre). Switch crop or adjust your transport rate in Market settings.
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 10.4 BUYERS ==================================== */}
      {section === "buyers" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.4 · Buyer Directory"
            title="Verified buyers for your next harvest"
            subtitle="Brokers, supermarkets, exporters, restaurants and cooperatives — with payment terms, ratings and one-tap contact."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => csvDownload(`buyers-${Date.now()}.csv`, [
                  ["Name","Type","Location","Crops","Min qty","Payment","Phone","Rating"],
                  ...BUYERS.map((b) => [b.name, b.type, b.location, b.cropsWanted.join("; "), b.minQuantity, b.paymentTerms, b.phone, b.rating]),
                ])}><Download /> CSV</button>
              </div>
            }
          />
          <div className="gm-mk-toolbar">
            <div className="gm-mk-search">
              <Search width={16} height={16} />
              <input className="gm-input" placeholder="Search buyer, crop or town…" value={buyerQuery} onChange={(e) => { setBuyerQuery(e.target.value); setBuyerPage(1); }} />
            </div>
            <div className="gm-filter-chips">
              <button className={`gm-filter-chip ${buyerTypeFilter === "All" ? "is-active" : ""}`} onClick={() => { setBuyerTypeFilter("All"); setBuyerPage(1); }}><Filter width={14} /> All types</button>
              {buyerTypes.filter((t) => t !== "All").map((t) => (
                <button key={t} className={`gm-filter-chip ${buyerTypeFilter === t ? "is-active" : ""}`} onClick={() => { setBuyerTypeFilter(t); setBuyerPage(1); }}>{t}</button>
              ))}
            </div>
            <span className="gm-mk-count">{filteredBuyers.length} buyers</span>
          </div>
          {buyersShown.length === 0 ? (
            <div className="gm-empty">
              <div className="gm-empty-art">🔎</div>
              <h4>No buyers match</h4>
              <p>Try a different filter or clear the search.</p>
              <button className="gm-btn gm-btn-outline" onClick={() => { setBuyerQuery(""); setBuyerTypeFilter("All"); }}>Clear filters</button>
            </div>
          ) : (
            <div className="gm-mk-buyer-grid">
              {buyersShown.map((b) => (
                <BuyerCard key={b.id} buyer={b}
                  onOpen={(buyer) => { setSelectedBuyer(buyer); setModal("buyer-detail"); }}
                  onContact={(buyer) => { setSelectedBuyer(buyer); setModal("buyer-contact"); }}
                />
              ))}
            </div>
          )}
          <Pagination page={buyerPage} total={buyerPages} perPage={buyerPerPage} totalItems={filteredBuyers.length} onChange={(p) => setBuyerPage(p)} />
        </Reveal>
      ) : null}

      {/* ==================================== 10.5 PLANNER ==================================== */}
      {section === "planner" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.5 · Harvest Sales Planner"
            title="Cabbage (0.5 acre, 14,500 heads · harvest 15 Jan)"
            subtitle="Compare four ways to sell this harvest. The AI recommends storing for 2 weeks to capture the Jan peak."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => csvDownload(`sales-plan-${Date.now()}.csv`, [
                  ["Scenario","Qty","Price/head","Gross","Transport","Fees","Net","vs baseline"],
                  ...SALES_SCENARIOS.map((s) => [s.label, s.quantity, s.pricePerHead, s.grossRevenue, s.transport, s.marketFees, s.netRevenue, s.vsBaseline]),
                ])}><Download /> Plan CSV</button>
              </div>
            }
          />
          <div className="gm-card-grid-3">
            <DashboardMetric icon={Award} label="AI pick" value="Store 2 weeks" note={`+${kes(143550)} vs Marikiti baseline`} />
            <DashboardMetric icon={TrendingUp} label="Predicted peak" value="KES 40" note="Per head on 29 Jan" />
            <DashboardMetric icon={Car} label="Cool storage" value={kes(8000)} note="Shade-net store · 3% spoilage risk" />
          </div>
          <div className="gm-mk-scenario-grid" style={{ marginTop: "1rem" }}>
            {SALES_SCENARIOS.map((s) => (
              <ScenarioCard key={s.id} s={s}
                onOpen={(sc) => { setSelectedScenario(sc); setModal("scenario-detail"); }}
              />
            ))}
          </div>
          <div className="gm-mk-callout tone-good" style={{ marginTop: "1rem" }}>
            <strong>AI recommendation.</strong> Store 2 weeks and sell at peak for <strong>{kes(545200)}</strong> net — an extra <strong>{kes(143550)}</strong> versus selling all at Marikiti on harvest day. Requires cool storage and a 2-week wait, but risk is moderate because dry-season supply drops predictably in late January.
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 10.6 SALES LOG ==================================== */}
      {section === "sales" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.6 · Sales Recording"
            title="Every sale in one book"
            subtitle="Logged sales automatically write records, finance and analytics entries. Filter by status to chase overdue invoices."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => csvDownload(`sales-${Date.now()}.csv`, [
                  ["ID","Date","Crop","Qty","Unit","Price","Total","Buyer","Method","Receipt","Status","Transport","Fees","Net","Grade","Notes"],
                  ...filteredSales.map((s) => [s.id, s.date, s.crop, s.quantity, s.unit, s.pricePerUnit, s.totalAmount, s.buyer, s.paymentMethod, s.mpesaReceipt ?? "", s.paymentStatus, s.transportCost, s.marketFees, s.netIncome, s.qualityGrade, s.notes]),
                ])}><Download /> CSV</button>
                <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { setSelectedBuyer(null); setModal("record-sale"); }}><Plus /> Record sale</button>
              </div>
            }
          />
          <div className="gm-mk-toolbar">
            <div className="gm-mk-search">
              <Search width={16} height={16} />
              <input className="gm-input" placeholder="Search crop, buyer or receipt…" value={salesQuery} onChange={(e) => { setSalesQuery(e.target.value); setSalesPage(1); }} />
            </div>
            <div className="gm-filter-chips">
              {["All","Received","Pending","Overdue","Partial"].map((s) => (
                <button key={s} className={`gm-filter-chip ${salesStatusFilter === s ? "is-active" : ""}`} onClick={() => { setSalesStatusFilter(s); setSalesPage(1); }}>{s}</button>
              ))}
            </div>
            <span className="gm-mk-count">{filteredSales.length} sales · net {kes(filteredSales.reduce((a, s) => a + s.netIncome, 0))}</span>
          </div>
          <div className="gm-card gm-card-flush">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Crop</th><th>Qty</th><th>Unit price</th><th>Gross</th><th>Buyer</th><th>Payment</th><th>Status</th><th>Net</th><th>Grade</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {salesShown.map((s) => (
                    <SaleRow key={s.id} sale={s} onOpen={(sl) => { setSelectedSale(sl); setModal("sale-detail"); }} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={salesPage} total={salesPages} perPage={salesPerPage} totalItems={filteredSales.length} onChange={(p) => setSalesPage(p)} />
        </Reveal>
      ) : null}

      {/* ==================================== 10.7 CONTRACTS ==================================== */}
      {section === "contracts" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10.7 · Contract Farming Board"
            title="Secure offtake at a guaranteed price"
            subtitle="Open contracts filtered by your county and crops. Applying opens an outgrower conversation with the company."
            action={
              <div className="d-flex gap-2">
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("faq")}><HelpCircle /> Eligibility FAQ</button>
              </div>
            }
          />
          <div className="gm-mk-toolbar">
            <div className="gm-mk-search">
              <Search width={16} height={16} />
              <input className="gm-input" placeholder="Search company or crop…" value={contractQuery} onChange={(e) => { setContractQuery(e.target.value); setContractPage(1); }} />
            </div>
            <span className="gm-mk-count">{contracts.filter((c) => c.status === "open").length} open · {contracts.filter((c) => c.status === "applied").length} applied</span>
          </div>
          {contractsShown.length === 0 ? (
            <div className="gm-empty">
              <div className="gm-empty-art">📄</div>
              <h4>No contracts match</h4>
              <p>Try a different crop or company name.</p>
            </div>
          ) : (
            <div className="gm-mk-contract-grid">
              {contractsShown.map((c) => (
                <ContractCard key={c.id} c={c}
                  onView={(ct) => { setSelectedContract(ct); setModal("contract-detail"); }}
                  onApply={(ct) => { setSelectedContract(ct); setModal("apply-contract"); }}
                />
              ))}
            </div>
          )}
          <Pagination page={contractPage} total={contractPages} perPage={contractPerPage} totalItems={filteredContracts.length} onChange={(p) => setContractPage(p)} />
          <div className="gm-mk-callout tone-info" style={{ marginTop: "1rem" }}>
            📝 Before applying, confirm you meet GlobalG.A.P. and spray-record requirements where stated. GrowMO can walk you through certification (Records page → Compliance centre).
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== DRAWERS ==================================== */}
      <DashboardDrawer open={drawer === "activity"} title="Market activity" onClose={() => setDrawer(null)} footer={<button type="button" className="gm-btn gm-btn-lime" onClick={() => setDrawer(null)}>Close</button>}>
        <MarketKv items={[
          { k: "Net YTD", v: kes(totals.salesYtd) },
          { k: "Gross YTD", v: kes(totals.grossYtd) },
          { k: "Transport YTD", v: kes(totals.transportYtd) },
          { k: "Market fees YTD", v: kes(totals.feesYtd) },
          { k: "Pending payments", v: kes(totals.pending), tone: "warn" },
        ]} />
        <h4 className="gm-h-section-sm" style={{ marginTop: "1rem" }}>Recent receipts</h4>
        {sales.slice(0, 6).map((s) => (
          <div key={s.id} className="gm-mk-kv-row"><span className="gm-mk-kv-k">{s.id} · {s.date}</span><span className="gm-mk-kv-v">{kes(s.netIncome)}</span></div>
        ))}
      </DashboardDrawer>

      {/* ==================================== MODALS ==================================== */}
      <CropPriceDialog open={modal === "crop-detail"} onClose={() => setModal(null)} crop={selectedCrop}
        onSetAlert={(c) => { setSelectedCrop(c); setModal("alert-wizard"); }}
        onTrend={(c) => { setSelectedCrop(c); setModal("trend"); }}
      />
      <TrendDialog open={modal === "trend"} onClose={() => setModal(null)} crop={selectedCrop} />
      <TrendPointDialog open={modal === "trend-point"} onClose={() => setModal(null)} point={selectedPoint} />
      <PriceAlertWizard open={modal === "alert-wizard"} onClose={() => setModal(null)} crop={selectedCrop} />
      <RecommendationDetailDialog open={modal === "rec-detail"} onClose={() => setModal(null)} rec={selectedRec}
        onPlan={(r) => { setSelectedRec(r); setSelectedScenario(SALES_SCENARIOS[0]); setModal("activate-plan"); }}
      />
      <BuyerDetailDialog open={modal === "buyer-detail"} onClose={() => setModal(null)} buyer={selectedBuyer}
        onContact={(b) => { setSelectedBuyer(b); setModal("buyer-contact"); }}
        onRecordSale={(b) => { setSelectedBuyer(b); setModal("record-sale"); }}
      />
      <ContactBuyerDialog open={modal === "buyer-contact"} onClose={() => setModal(null)} buyer={selectedBuyer} />
      <QuickPhoneDialog open={modal === "buyer-phone"} onClose={() => setModal(null)} buyer={selectedBuyer} />
      <ScenarioDetailDialog open={modal === "scenario-detail"} onClose={() => setModal(null)} scenario={selectedScenario}
        onActivate={(s) => { setSelectedScenario(s); setModal("activate-plan"); }}
      />
      <ActivatePlanWizard open={modal === "activate-plan"} onClose={() => setModal(null)} scenario={selectedScenario} />
      <SaleDetailDialog open={modal === "sale-detail"} onClose={() => setModal(null)} sale={selectedSale}
        onShare={(s) => { setSelectedSale(s); setModal("share"); }}
        onPrint={() => window.print()}
      />
      <RecordSaleWizard open={modal === "record-sale"} onClose={() => setModal(null)} presetBuyer={selectedBuyer} onSaved={handleRecordSale} />
      <ContractDetailDialog open={modal === "contract-detail"} onClose={() => setModal(null)} contract={selectedContract}
        onApply={(c) => { setSelectedContract(c); setModal("apply-contract"); }}
      />
      <ApplyContractWizard open={modal === "apply-contract"} onClose={() => setModal(null)} contract={selectedContract} onApplied={handleApplyContract} />
      <TransportCompareDialog open={modal === "transport"} onClose={() => setModal(null)} />
      <MarketExportDialog open={modal === "export"} onClose={() => setModal(null)} />
      <MarketShareDialog open={modal === "share"} onClose={() => setModal(null)} title={selectedSale ? `Sale ${selectedSale.id}` : "Market prices"} />
      <MarketSettingsDialog open={modal === "settings"} onClose={() => setModal(null)} />
      <MarketFaqDialog open={modal === "faq"} onClose={() => setModal(null)} />
      <MarketScoreDialog open={modal === "score"} onClose={() => setModal(null)} score={MARKET_CONTEXT.marketScore} />
      <MarketAlertsDialog open={modal === "alerts"} onClose={() => setModal(null)} />
      <ConfirmMarketDialog open={modal === "confirm-delete-sale"} onClose={() => setModal(null)} title="Remove sale?" desc="This will remove the sale from your ledger and create a correction note in records." confirmLabel="Remove" danger
        onConfirm={() => { if (selectedSale) { setSales((s) => s.filter((x) => x.id !== selectedSale.id)); toast.notify("Sale removed", "info"); } }}
      />

      <div style={{ height: "3rem" }} />
    </div>
  );
}
