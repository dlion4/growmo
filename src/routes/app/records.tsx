/* ============================================================================
   PAGE 12 — RECORDS, TRACEABILITY & COMPLIANCE  (/app/records)

   Blueprint sections implemented:
   12.1 Farm diary              12.2 Complete spray record (compliance grade)
   12.3 Input purchase records  12.4 Harvest & batch traceability
   12.5 Certification tracker   12.6 Soil test records
   Plus a compliance centre: score breakdown, open gaps, evidence library,
   third-party data requests, monthly record activity, retention rules and FAQs.

   The page keeps an honest working record book in local state: new diary
   entries, sprays, purchases, batches, certifications, soil tests, exports,
   share links and audit bookings all change what is on the screen.
   ========================================================================== */
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Layers,
  LayoutGrid,
  List,
  Package,
  LockKeyhole,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  QrCode,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Table2,
  Trash2,
  TriangleAlert,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  AuditBookingDialog,
  BatchDeliveryDialog,
  BatchTraceDialog,
  BatchWizard,
  CertChecklistDialog,
  CertWizard,
  ConfirmRecordDialog,
  CorrectiveActionWizard,
  DataShareDialog,
  DiaryWizard,
  EvidencePackDialog,
  ExportPackDialog,
  GapFixWizard,
  PhotoViewerDialog,
  PurchaseWizard,
  QrShareDialog,
  ReceiptViewerDialog,
  RecordsSettingsDialog,
  RequestRespondDialog,
  SoilReportDialog,
  SoilTestWizard,
  SprayDetailDialog,
  SprayWizard,
} from "../../components/app/RecordsModals";
import {
  BatchSummaryCard,
  CertProgressCard,
  ComplianceGapRow,
  DiaryEntryCard,
  EvidenceDocRow,
  PhiMeter,
  QrTile,
  RecordKvList,
  RecordsHero,
  RecordsMonthChart,
  SoilSampleRow,
  SoilTrendChart,
  TraceTimeline,
} from "../../components/app/RecordsWidgets";
import type {
  CertChecklistItem,
  Certification,
  ComplianceGap,
  DiaryEntry,
  HarvestBatch,
  PurchaseRecord,
  SoilSample,
  SprayRecord,
} from "../../data/app/records";
import type { RecordKpi } from "../../components/app/RecordsWidgets";
import {
  AUDITORS,
  CERTIFICATIONS,
  COMPLIANCE_GAPS,
  DIARY_ENTRIES,
  DIARY_TYPES,
  EVIDENCE_DOCUMENTS,
  HARVEST_BATCHES,
  PURCHASES,
  RECORD_ACTIVITY,
  RECORD_CONTEXT,
  RECORD_FAQ,
  RECORD_REQUESTS,
  RECORD_SETTINGS,
  RETENTION_RULES,
  SOIL_TESTS,
  SPRAY_RECORDS,
  certTone,
  recordTotals,
} from "../../data/app/records";
import { kes } from "../../data/site";
import { Pagination, Reveal } from "../../components/ui/primitives";
import { useToast } from "../../store/toast";
import { Toggle } from "../../components/auth/controls";

type RecordView =
  | "diary"
  | "spray"
  | "purchases"
  | "batches"
  | "certification"
  | "soil"
  | "compliance";

type ModalId =
  | "diary-new"
  | "diary-edit"
  | "diary-delete"
  | "photo"
  | "spray-new"
  | "spray-detail"
  | "corrective"
  | "purchase-new"
  | "receipt"
  | "batch-new"
  | "batch-trace"
  | "batch-share"
  | "batch-delivery"
  | "cert-wizard"
  | "cert-checklist"
  | "audit-book"
  | "soil-new"
  | "soil-report"
  | "export"
  | "share"
  | "settings"
  | "gap-fix"
  | "evidence"
  | "request"
  | null;

type DrawerId = "diary" | "batch" | "certification" | null;

type AuditBooking = {
  id: string;
  auditor: string;
  date: string;
  receipt: string;
};

export const Route = createFileRoute("/app/records")({
  component: RecordsPage,
});

/* ----------------------------------------------------------- diary section */

function DiarySection({
  entries,
  onNew,
  onOpen,
  onEdit,
  onPhoto,
  toastNote,
}: {
  entries: DiaryEntry[];
  onNew: () => void;
  onOpen: (entry: DiaryEntry) => void;
  onEdit: (entry: DiaryEntry) => void;
  onPhoto: (photo: string) => void;
  toastNote: (entry: DiaryEntry) => void;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      entries.filter((entry) => {
        const haystack =
          `${entry.content} ${entry.crop} ${entry.variety} ${entry.location} ${entry.author} ${entry.tags.join(" ")}`.toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (type === "all" || entry.type === type)
        );
      }),
    [entries, search, type],
  );
  const perPage = layout === "cards" ? 6 : 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const problems = entries.filter((entry) => entry.type === "Problem").length;
  const photos = entries.reduce((sum, entry) => sum + entry.photos.length, 0);

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12.1 · Farm diary"
        title="The day-by-day story of the shamba"
        subtitle="Activities, observations, weather, decisions and market notes — the narrative an auditor reads before trusting a single spray record."
        action={
          <div className="d-flex flex-wrap gap-2">
            <div className="gm-seg">
              <button
                type="button"
                className={layout === "cards" ? "on" : ""}
                onClick={() => {
                  setLayout("cards");
                  setPage(1);
                }}
              >
                <LayoutGrid /> Cards
              </button>
              <button
                type="button"
                className={layout === "table" ? "on" : ""}
                onClick={() => {
                  setLayout("table");
                  setPage(1);
                }}
              >
                <List /> Table
              </button>
            </div>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
              <Plus /> New entry
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={ClipboardList} label="Diary entries" value={String(entries.length)} note="since June 2026" />
        <DashboardMetric icon={TriangleAlert} label="Problem entries" value={String(problems)} note="pests, disease, rodents" />
        <DashboardMetric icon={Camera} label="Photo evidence" value={String(photos)} note="attached to entries" />
        <DashboardMetric
          icon={CalendarClock}
          label="Last entry"
          value={entries[0]?.date ?? "—"}
          note={`by ${entries[0]?.author ?? "—"}`}
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-rec-toolbar">
          <div className="gm-field">
            <label htmlFor="diary-search">Search the diary</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="diary-search"
                className="gm-input"
                value={search}
                placeholder="Content, crop, tag or person"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="diary-type">Entry type</label>
            <select
              id="diary-type"
              className="gm-select"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All entry types</option>
              {DIARY_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              setSearch("");
              setType("all");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {DIARY_TYPES.map((item) => (
            <button
              type="button"
              key={item}
              className={`gm-filter-chip ${type === item ? "is-active" : ""}`}
              onClick={() => {
                setType(type === item ? "all" : item);
                setPage(1);
              }}
            >
              {item}
              <span className="gm-n">{entries.filter((entry) => entry.type === item).length}</span>
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="gm-empty">
            <span className="gm-service-icon">
              <ClipboardList />
            </span>
            <h3 className="font-display">No diary entries match that search</h3>
            <p className="text-muted">
              Try a different keyword, or write the entry now — the record book is
              only as good as today.
            </p>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
              <Plus /> Write an entry
            </button>
          </div>
        ) : layout === "cards" ? (
          <div className="row g-3">
            {rows.map((entry) => (
              <div className="col-lg-6 col-xl-4" key={entry.id}>
                <DiaryEntryCard entry={entry} onOpen={() => onOpen(entry)} onPhoto={onPhoto} />
              </div>
            ))}
          </div>
        ) : (
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Entry</th>
                  <th>Crop & plot</th>
                  <th>Recorded by</th>
                  <th>Photos</th>
                  <th>Linked record</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td className="font-display">{entry.date}</td>
                    <td>
                      <StatusChip
                        label={entry.type}
                        tone={
                          entry.type === "Problem"
                            ? "high"
                            : entry.type === "Weather event"
                              ? "medium"
                              : "neutral"
                        }
                      />
                    </td>
                    <td style={{ minWidth: 260 }}>
                      {entry.content.length > 96 ? `${entry.content.slice(0, 96)}…` : entry.content}
                    </td>
                    <td>
                      {entry.crop}
                      <small className="d-block text-muted">{entry.plot}</small>
                    </td>
                    <td>{entry.author}</td>
                    <td>{entry.photos.length ? `${entry.photos.length} photo(s)` : "—"}</td>
                    <td>{entry.linked || "—"}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Open diary entry ${entry.date}`}
                          onClick={() => onOpen(entry)}
                        >
                          <FileText />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Edit diary entry ${entry.date}`}
                          onClick={() => onEdit(entry)}
                        >
                          <Pencil />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Log ${entry.date} to the compliance pack`}
                          onClick={() => toastNote(entry)}
                        >
                          <ShieldCheck />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- spray section */

function SpraySection({
  records,
  onNew,
  onOpen,
  onComplete,
  onCorrective,
}: {
  records: SprayRecord[];
  onNew: () => void;
  onOpen: (record: SprayRecord) => void;
  onComplete: (record: SprayRecord) => void;
  onCorrective: (record: SprayRecord) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const haystack =
          `${record.code} ${record.product} ${record.target} ${record.plot} ${record.applicator} ${record.batchNo}`.toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (status === "all" || record.status === status)
        );
      }),
    [records, search, status],
  );
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const incomplete = records.filter((record) => record.status === "Incomplete").length;
  const blocked = records.filter((record) => record.status === "Blocked").length;
  const cleared = records.filter((record) => record.status === "Complete").length;
  const sprays = records.reduce((sum, record) => sum + record.cost, 0);

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12.2 · Complete spray record"
        title="A spray record an auditor can defend"
        subtitle="Product, active ingredient, batch number, rate, volume, area, applicator, PPE, wind, temperature, pre-harvest interval and the next safe harvest date — one row per application."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                const header = [
                  "Code,Date,Crop,Plot,Target,Product,Active ingredient,Batch,Rate,Volume,Area,Applicator,PPE,Wind,Temp,PHI days,Next safe harvest,Status",
                ];
                const body = records.map((record) =>
                  [
                    record.code,
                    record.date,
                    record.crop,
                    record.plot,
                    record.target,
                    record.product,
                    record.activeIngredient,
                    record.batchNo,
                    record.rate,
                    record.volumeMixed,
                    record.areaTreated,
                    record.applicator,
                    record.ppe.join("; "),
                    record.wind,
                    record.temp,
                    record.phiDays,
                    record.nextSafeHarvest,
                    record.status,
                  ]
                    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                    .join(","),
                );
                const blob = new Blob([[...header, ...body].join("\n")], {
                  type: "text/csv",
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "growmo-spray-records.csv";
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download /> Export spray records
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
              <Plus /> Log a spray
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Sprout} label="Applications logged" value={String(records.length)} note="Jan – Sep 2026" />
        <DashboardMetric icon={CheckCircle2} label="PHI cleared" value={String(cleared)} note="safe to harvest" />
        <DashboardMetric icon={TriangleAlert} label="Incomplete records" value={String(incomplete)} note="missing fields flagged" />
        <DashboardMetric icon={ShieldCheck} label="Product spend" value={kes(sprays)} note={`${blocked} blocked entr${blocked === 1 ? "y" : "ies"}`} />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-8">
          <div className="gm-card p-3 h-100">
            <div className="gm-rec-toolbar">
              <div className="gm-field">
                <label htmlFor="spray-search">Search applications</label>
                <div className="gm-search-field">
                  <Search />
                  <input
                    id="spray-search"
                    className="gm-input"
                    value={search}
                    placeholder="Code, product, target, plot or applicator"
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="gm-field">
                <label htmlFor="spray-status">Status</label>
                <select
                  id="spray-status"
                  className="gm-select"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="Complete">Complete</option>
                  <option value="Planned">Planned</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Crop & plot</th>
                    <th>Target</th>
                    <th>Product & batch</th>
                    <th>Rate</th>
                    <th>Volume / area</th>
                    <th>Applicator & PPE</th>
                    <th>Conditions</th>
                    <th>PHI</th>
                    <th>Next safe harvest</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((record) => (
                    <tr key={record.id}>
                      <td className="font-display">{record.code}</td>
                      <td>{record.date}</td>
                      <td>
                        {record.crop}
                        <small className="d-block text-muted">{record.plot}</small>
                      </td>
                      <td>{record.target}</td>
                      <td>
                        {record.product}
                        <small className="d-block text-muted">
                          {record.activeIngredient} · {record.batchNo}
                        </small>
                      </td>
                      <td>{record.rate}</td>
                      <td>
                        {record.volumeMixed}
                        <small className="d-block text-muted">{record.areaTreated}</small>
                      </td>
                      <td>
                        {record.applicator}
                        <small className="d-block text-muted">
                          {record.ppe.length ? record.ppe.join(", ") : "No PPE recorded"}
                        </small>
                      </td>
                      <td>
                        {record.wind}
                        <small className="d-block text-muted">{record.temp}</small>
                      </td>
                      <td>{record.phiDays === 0 ? "None" : `${record.phiDays} days`}</td>
                      <td className="font-display">{record.nextSafeHarvest}</td>
                      <td>
                        <StatusChip
                          label={record.status}
                          tone={
                            record.status === "Complete"
                              ? "low"
                              : record.status === "Blocked"
                                ? "high"
                                : "medium"
                          }
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="gm-iconbtn"
                            aria-label={`Open spray record ${record.code}`}
                            onClick={() => onOpen(record)}
                          >
                            <FileText />
                          </button>
                          {record.status === "Incomplete" ? (
                            <button
                              type="button"
                              className="gm-iconbtn"
                              aria-label={`Complete spray record ${record.code}`}
                              onClick={() => onComplete(record)}
                            >
                              <Check />
                            </button>
                          ) : null}
                          {record.status === "Blocked" || !record.ppe.includes("Overalls") ? (
                            <button
                              type="button"
                              className="gm-iconbtn danger"
                              aria-label={`Corrective action for ${record.code}`}
                              onClick={() => onCorrective(record)}
                            >
                              <TriangleAlert />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              total={totalPages}
              onChange={setPage}
              perPage={perPage}
              totalItems={filtered.length}
            />
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Pre-harvest intervals</span>
            <h3 className="font-display mb-1">Harvest safety countdown</h3>
            <p className="text-muted">
              The plot cannot carry a QR batch label until the longest PHI on that
              plot has cleared.
            </p>
            <div className="d-flex flex-column gap-3">
              {records.slice(0, 5).map((record) => (
                <PhiMeter key={record.id} record={record} />
              ))}
            </div>
            <div className="gm-check-row mt-3">
              <ShieldCheck />
              <span style={{ flex: 1 }}>
                <strong>Harvest date 28 Sep 2026 is safe</strong>
                <small>
                  Longest outstanding PHI: Imidacloprid 21 days, cleared 14 Sep 2026.
                </small>
              </span>
              <StatusChip label="Cleared" tone="low" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- purchase section */

function PurchaseSection({
  purchases,
  onNew,
  onOpen,
  onQuerySupplier,
}: {
  purchases: PurchaseRecord[];
  onNew: () => void;
  onOpen: (record: PurchaseRecord) => void;
  onQuerySupplier: (record: PurchaseRecord) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [receipt, setReceipt] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      purchases.filter((record) => {
        const haystack =
          `${record.input} ${record.supplier} ${record.invoiceNo} ${record.batchNo} ${record.certNo} ${record.supplierCounty}`.toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (category === "all" || record.category === category) &&
          (receipt === "all" || (receipt === "with" ? record.receipt : !record.receipt))
        );
      }),
    [purchases, search, category, receipt],
  );
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const total = purchases.reduce((sum, record) => sum + record.total, 0);
  const withReceipt = purchases.filter((record) => record.receipt).length;

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12.3 · Input purchase records"
        title="Every input traceable back to the shop"
        subtitle="Invoice number, supplier and phone, batch or lot number, expiry and the certificate that proves the input is legal in Kenya."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
            <Plus /> Record a purchase
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Table2} label="Purchase entries" value={String(purchases.length)} note="agricultural inputs" />
        <DashboardMetric icon={BarChart3} label="Season input spend" value={kes(total)} note="fertilizer, seed, protection" />
        <DashboardMetric
          icon={FileSpreadsheet}
          label="Receipt coverage"
          value={`${Math.round((withReceipt / purchases.length) * 100)}%`}
          note={`${withReceipt} of ${purchases.length} invoices filed`}
        />
        <DashboardMetric icon={BadgeCheck} label="Certified inputs" value={String(purchases.filter((r) => r.certNo).length)} note="KEPHIS, PCPB or KEBS numbers" />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-rec-toolbar">
          <div className="gm-field">
            <label htmlFor="purchase-search">Search purchases</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="purchase-search"
                className="gm-input"
                value={search}
                placeholder="Input, supplier, invoice or batch"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="purchase-category">Category</label>
            <select
              id="purchase-category"
              className="gm-select"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All categories</option>
              <option>Fertilizer</option>
              <option>Crop protection</option>
              <option>Seed</option>
              <option>Soil amendment</option>
              <option>Equipment</option>
            </select>
          </div>
          <div className="gm-field">
            <label htmlFor="purchase-receipt">Receipt</label>
            <select
              id="purchase-receipt"
              className="gm-select"
              value={receipt}
              onChange={(event) => {
                setReceipt(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All entries</option>
              <option value="with">Receipt on file</option>
              <option value="without">Receipt missing</option>
            </select>
          </div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Input</th>
                <th>Supplier</th>
                <th>Invoice</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Total</th>
                <th>Batch / lot</th>
                <th>Expiry</th>
                <th>Certificate</th>
                <th>Receipt</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((record) => (
                <tr key={record.id}>
                  <td className="font-display">{record.date}</td>
                  <td>
                    {record.input}
                    <small className="d-block text-muted">{record.category}</small>
                  </td>
                  <td>
                    {record.supplier}
                    <small className="d-block text-muted">
                      {record.supplierCounty} · {record.supplierPhone}
                    </small>
                  </td>
                  <td>{record.invoiceNo}</td>
                  <td>{record.qty}</td>
                  <td className="font-display">{kes(record.unitPrice)}</td>
                  <td className="font-display">{kes(record.total)}</td>
                  <td>{record.batchNo || "—"}</td>
                  <td>{record.expiry}</td>
                  <td>{record.certNo || "—"}</td>
                  <td>
                    <StatusChip
                      label={record.receipt ? "On file" : "Missing"}
                      tone={record.receipt ? "low" : "high"}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Open receipt ${record.invoiceNo}`}
                        onClick={() => onOpen(record)}
                      >
                        <FileText />
                      </button>
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Query ${record.supplier}`}
                        onClick={() => onQuerySupplier(record)}
                      >
                        <Mail />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- batch section */

function BatchSection({
  batches,
  onNew,
  onTrace,
  onShare,
  onDelivery,
  toastNote,
}: {
  batches: HarvestBatch[];
  onNew: () => void;
  onTrace: (batch: HarvestBatch) => void;
  onShare: (batch: HarvestBatch) => void;
  onDelivery: (batch: HarvestBatch) => void;
  toastNote: (batch: HarvestBatch) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      batches.filter((batch) => {
        const haystack =
          `${batch.batchId} ${batch.crop} ${batch.variety} ${batch.plot} ${batch.buyer} ${batch.destination}`.toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (status === "all" || batch.status === status)
        );
      }),
    [batches, search, status],
  );
  const perPage = layout === "cards" ? 4 : 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const scans = batches.reduce((sum, batch) => sum + batch.qrScans, 0);
  const value = batches.reduce((sum, batch) => sum + batch.value, 0);

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12.4 · Harvest & batch traceability"
        title="Every crate carries its own passport"
        subtitle="A batch ID and QR code link the crate back to the plot, the planting date, the inputs used, every spray and the soil test on file."
        action={
          <div className="d-flex flex-wrap gap-2">
            <div className="gm-seg">
              <button
                type="button"
                className={layout === "cards" ? "on" : ""}
                onClick={() => {
                  setLayout("cards");
                  setPage(1);
                }}
              >
                <LayoutGrid /> Cards
              </button>
              <button
                type="button"
                className={layout === "table" ? "on" : ""}
                onClick={() => {
                  setLayout("table");
                  setPage(1);
                }}
              >
                <List /> Table
              </button>
            </div>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
              <Plus /> Create a batch
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Layers} label="Batches" value={String(batches.length)} note="Jan 2026 to date" />
        <DashboardMetric icon={ScanLine} label="Buyer QR scans" value={String(scans)} note="crates scanned by buyers" />
        <DashboardMetric icon={BarChart3} label="Recorded value" value={kes(value)} note="all batches" />
        <DashboardMetric icon={Truck} label="Delivered or sold" value={String(batches.filter((b) => b.status === "Sold" || b.status === "Delivered").length)} note="trace loop closed" />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-rec-toolbar">
          <div className="gm-field">
            <label htmlFor="batch-search">Search batches</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="batch-search"
                className="gm-input"
                value={search}
                placeholder="Batch ID, crop, plot or buyer"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="batch-status">Batch status</label>
            <select
              id="batch-status"
              className="gm-select"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option>Sold</option>
              <option>Delivered</option>
              <option>In transit</option>
              <option>Stored</option>
              <option>Planned</option>
              <option>Awaiting QC</option>
            </select>
          </div>
        </div>
        {layout === "cards" ? (
          <div className="row g-3">
            {rows.map((batch) => (
              <div className="col-lg-6 col-xl-6" key={batch.id}>
                <BatchSummaryCard
                  batch={batch}
                  onTrace={() => onTrace(batch)}
                  onShare={() => onShare(batch)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Crop</th>
                  <th>Plot & area</th>
                  <th>Harvested</th>
                  <th>Quantity</th>
                  <th>Grade split</th>
                  <th>Last spray</th>
                  <th>PHI cleared</th>
                  <th>Destination</th>
                  <th>Scans</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((batch) => (
                  <tr key={batch.id}>
                    <td className="font-display">{batch.batchId}</td>
                    <td>
                      {batch.crop}
                      <small className="d-block text-muted">{batch.variety}</small>
                    </td>
                    <td>
                      {batch.plot}
                      <small className="d-block text-muted">{batch.area}</small>
                    </td>
                    <td>{batch.harvested}</td>
                    <td>{batch.quantity}</td>
                    <td>
                      A {batch.gradeA.toLocaleString("en-KE")} · B {batch.gradeB.toLocaleString("en-KE")} · C{" "}
                      {batch.gradeC.toLocaleString("en-KE")}
                    </td>
                    <td>{batch.lastSpray}</td>
                    <td>{batch.phiCleared}</td>
                    <td>{batch.destination}</td>
                    <td>{batch.qrScans}</td>
                    <td>
                      <StatusChip
                        label={batch.status}
                        tone={
                          batch.status === "Sold" || batch.status === "Delivered"
                            ? "low"
                            : batch.status === "Planned" || batch.status === "Stored"
                              ? "medium"
                              : "neutral"
                        }
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Trace ${batch.batchId}`}
                          onClick={() => onTrace(batch)}
                        >
                          <QrCode />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Share ${batch.batchId}`}
                          onClick={() => onShare(batch)}
                        >
                          <Printer />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Log delivery for ${batch.batchId}`}
                          onClick={() => onDelivery(batch)}
                        >
                          <Truck />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Save ${batch.batchId} to the evidence pack`}
                          onClick={() => toastNote(batch)}
                        >
                          <ShieldCheck />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
    </section>
  );
}

/* --------------------------------------------------- certification section */

function CertificationSection({
  certs,
  audits,
  onOpenWizard,
  onOpenChecklist,
  onBookAudit,
  onCertDetails,
}: {
  certs: Certification[];
  audits: AuditBooking[];
  onOpenWizard: (cert: Certification | null) => void;
  onOpenChecklist: (cert: Certification) => void;
  onBookAudit: (cert: Certification | null) => void;
  onCertDetails: (cert: Certification) => void;
}) {
  const [filter, setFilter] = useState("all");
  const active = certs.filter((cert) => cert.status === "Certified" || cert.status === "Active").length;
  const inProgress = certs.filter((cert) => cert.status === "In progress").length;
  const avg = Math.round(certs.reduce((sum, cert) => sum + cert.progress, 0) / certs.length);
  const shown = certs.filter((cert) => filter === "all" || cert.status === filter);

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12.5 · Certification tracker"
        title="Certification progress that moves itself"
        subtitle="KS1758, GlobalG.A.P., organic conversion, PCPB, HCD, KEBS and NEMA — each programme reads the records you already keep and shows exactly what is still open."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onOpenWizard(null)}>
            <Plus /> Start or continue
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={ShieldCheck} label="Programmes tracked" value={String(certs.length)} note="Kenyan and international" />
        <DashboardMetric icon={CheckCircle2} label="Active or certified" value={String(active)} note="county reg, PCPB, group" />
        <DashboardMetric icon={Activity} label="In progress" value={String(inProgress)} note="KS1758, NEMA, GlobalG.A.P." />
        <DashboardMetric icon={BarChart3} label="Average progress" value={`${avg}%`} note="across all programmes" />
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {["all", "In progress", "Not started", "Certified", "Active", "N/A"].map((item) => (
          <button
            type="button"
            key={item}
            className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? "All programmes" : item}
            <span className="gm-n">
              {item === "all" ? certs.length : certs.filter((cert) => cert.status === item).length}
            </span>
          </button>
        ))}
      </div>
      <div className="row g-3 mt-2">
        {shown.map((cert) => (
          <div className="col-lg-6 col-xl-4" key={cert.id}>
            <CertProgressCard
              cert={cert}
              onOpen={() => onCertDetails(cert)}
              onChecklist={() => onOpenChecklist(cert)}
            />
          </div>
        ))}
      </div>
      <div className="row g-3 mt-3">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Upcoming audits & inspections</span>
            <h3 className="font-display mb-1">Who is coming, when and why</h3>
            <div className="gm-table-wrap mt-2">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Auditor</th>
                    <th>Organisation</th>
                    <th>Scope</th>
                    <th>Window</th>
                    <th>Fee</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {AUDITORS.map((auditor) => (
                    <tr key={auditor.id}>
                      <td>
                        {auditor.name}
                        <small className="d-block text-muted">{auditor.phone}</small>
                      </td>
                      <td>{auditor.org}</td>
                      <td>{auditor.scope}</td>
                      <td>{auditor.window}</td>
                      <td className="font-display">
                        {auditor.fee ? kes(auditor.fee) : "Free"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onBookAudit(null)}
                        >
                          Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Booked visits</span>
            <h3 className="font-display mb-1">Compliance calendar</h3>
            {audits.length === 0 ? (
              <p className="text-muted">
                No visit booked yet. Book the county advisory visit first — it is free
                and tells you what the official audit will ask for.
              </p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {audits.map((booking) => (
                  <div className="gm-check-row" key={booking.id}>
                    <CalendarClock />
                    <span style={{ flex: 1 }}>
                      <strong>{booking.auditor}</strong>
                      <small>
                        {booking.date} · confirmation {booking.receipt}
                      </small>
                    </span>
                    <StatusChip label="Booked" tone="low" />
                  </div>
                ))}
              </div>
            )}
            <div className="gm-check-row mt-3">
              <Sparkles />
              <span style={{ flex: 1 }}>
                <strong>Fastest route to KS1758</strong>
                <small>
                  Close the worker training and water test first — they are the only
                  two blocking items left.
                </small>
              </span>
              <StatusChip label="2 items" tone="medium" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- soil section */

function SoilSection({
  samples,
  onNew,
  onOpen,
  onFollowUp,
}: {
  samples: SoilSample[];
  onNew: () => void;
  onOpen: (sample: SoilSample) => void;
  onFollowUp: (sample: SoilSample) => void;
}) {
  const [metric, setMetric] = useState<"ph" | "organicMatter">("ph");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      samples.filter((sample) =>
        `${sample.plot} ${sample.crop} ${sample.lab} ${sample.labRef} ${sample.recommendation}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [samples, search],
  );
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const avgPh = samples.reduce((sum, sample) => sum + sample.ph, 0) / samples.length;
  const avgOm = samples.reduce((sum, sample) => sum + sample.organicMatter, 0) / samples.length;
  const spend = samples.reduce((sum, sample) => sum + sample.cost, 0);
  const plot1 = samples.filter((sample) => sample.plot === "Plot 1");

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12.6 · Soil test records"
        title="Soil chemistry with a memory"
        subtitle="pH, nitrogen, phosphorus, potassium, calcium, magnesium and organic matter per plot — with the recommendation that came with the report."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onNew}>
            <Plus /> Log a soil test
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={FlaskConical} label="Lab samples" value={String(samples.length)} note="KALRO and Cropnuts" />
        <DashboardMetric icon={Activity} label="Average pH" value={avgPh.toFixed(2)} note="target 6.0 – 6.5" />
        <DashboardMetric icon={Sprout} label="Organic matter" value={`${avgOm.toFixed(1)}%`} note="improving with manure" />
        <DashboardMetric icon={BarChart3} label="Testing spend" value={kes(spend)} note="since Sep 2024" />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">Plot 1 trend</span>
                <h3 className="font-display mb-1">
                  {metric === "ph" ? "pH after liming and manure" : "Organic matter building up"}
                </h3>
                <p className="text-muted mb-0">
                  {metric === "ph"
                    ? "pH moved from 5.3 in the 2024 baseline to 5.8 in September 2026."
                    : "Organic matter climbed from 2.4% to 3.2% over two years of manure."}
                </p>
              </div>
              <div className="gm-seg">
                <button
                  type="button"
                  className={metric === "ph" ? "on" : ""}
                  onClick={() => setMetric("ph")}
                >
                  pH
                </button>
                <button
                  type="button"
                  className={metric === "organicMatter" ? "on" : ""}
                  onClick={() => setMetric("organicMatter")}
                >
                  Organic matter
                </button>
              </div>
            </div>
            <div className="mt-3">
              <SoilTrendChart samples={plot1} metric={metric} />
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Agronomic actions</span>
            <h3 className="font-display mb-1">What the lab asked for</h3>
            <div className="d-flex flex-column gap-2">
              {samples.slice(0, 4).map((sample) => (
                <div className="gm-check-row" key={sample.id}>
                  <FlaskConical />
                  <span style={{ flex: 1 }}>
                    <strong>
                      {sample.plot} · {sample.date}
                    </strong>
                    <small>{sample.recommendation}</small>
                  </span>
                  <StatusChip
                    label={`pH ${sample.ph.toFixed(1)}`}
                    tone={sample.ph < 5.5 ? "medium" : "low"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-rec-toolbar">
          <div className="gm-field">
            <label htmlFor="soil-search">Search soil reports</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="soil-search"
                className="gm-input"
                value={search}
                placeholder="Plot, crop, laboratory or recommendation"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
        <div className="d-flex flex-column gap-2">
          {rows.map((sample) => (
            <SoilSampleRow
              key={sample.id}
              sample={sample}
              onOpen={() => onOpen(sample)}
            />
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => onFollowUp(rows[0] ?? samples[0])}
          >
            <ClipboardCheck /> Log the follow-up action
          </button>
          <Link to="/app/inventory" className="gm-btn gm-btn-soft">
            <Package /> Check lime and fertilizer stock
          </Link>
        </div>
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
    </section>
  );
}

/* --------------------------------------------------- compliance section */

function ComplianceSection({
  gaps,
  score,
  evidence,
  requests,
  onFix,
  onOpenEvidence,
  onRespond,
  onExport,
  onShare,
  onActivity,
  onSettings,
}: {
  gaps: ComplianceGap[];
  score: number;
  evidence: (typeof EVIDENCE_DOCUMENTS)[number][];
  requests: typeof RECORD_REQUESTS;
  onFix: (gap: ComplianceGap) => void;
  onOpenEvidence: (doc: (typeof EVIDENCE_DOCUMENTS)[number]) => void;
  onRespond: (request: (typeof RECORD_REQUESTS)[number]) => void;
  onExport: () => void;
  onShare: () => void;
  onActivity: (month: string) => void;
  onSettings: () => void;
}) {
  const [faqOpen, setFaqOpen] = useState<string | null>(RECORD_FAQ[0]?.q ?? null);
  const sections = [
    { id: "12.1 Farm diary", value: 92, note: "18 entries in September, 2 days to backfill" },
    { id: "12.2 Spray records", value: 74, note: "1 incomplete, 1 blocked with a corrective action" },
    { id: "12.3 Input purchases", value: 88, note: "11 of 12 receipts on file" },
    { id: "12.4 Batch traceability", value: 95, note: "10 batch passports, 1 delivery to verify" },
    { id: "12.5 Certification", value: 63, note: "KS1758 70%, water test missing" },
    { id: "12.6 Soil tests", value: 78, note: "Plot 2 sample is over 12 months old" },
  ];
  const openHigh = gaps.filter((gap) => gap.severity === "high").length;

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="12 · Compliance centre"
        title="One screen before any audit"
        subtitle="Score by section, open non-conformities, the evidence library, third-party requests and the retention rules that keep you out of trouble."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onSettings}>
              <Settings2 /> Record settings
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onExport}>
              <Download /> Export compliance pack
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={ShieldCheck} label="Compliance score" value={`${score}/100`} note="weighted across six sections" />
        <DashboardMetric icon={AlertTriangle} label="Open gaps" value={String(gaps.length)} note={`${openHigh} blocking item(s)`} />
        <DashboardMetric icon={FileText} label="Evidence packs" value={String(evidence.length)} note={`${evidence.filter((doc) => doc.verified).length} verified`} />
        <DashboardMetric icon={Mail} label="Data requests" value={String(requests.length)} note={`${requests.filter((request) => request.status === "Open").length} still open`} />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Score breakdown</span>
            <h3 className="font-display mb-1">Where the 78 points come from</h3>
            <div className="mt-3">
              {sections.map((section) => (
                <div key={section.id} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong style={{ fontSize: "0.86rem" }}>{section.id}</strong>
                    <span className="font-display">{section.value}%</span>
                  </div>
                  <ProgressLine value={section.value} label={`${section.id} completion`} />
                  <small className="text-muted">{section.note}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Monthly record activity</span>
            <h3 className="font-display mb-1">A full year of records</h3>
            <p className="text-muted">
              Tap a month to see how many entries, sprays and purchases were logged.
            </p>
            <RecordsMonthChart rows={RECORD_ACTIVITY} onBar={onActivity} />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <DashboardSectionHeader
          eyebrow="Open non-conformities"
          title="Close these before the auditor arrives"
          subtitle="Every gap carries an owner, a due date, a suggested fix and the evidence that will close it."
        />
        <div className="row g-3">
          {gaps.map((gap) => (
            <div className="col-lg-6 col-xl-4" key={gap.id}>
              <ComplianceGapRow gap={gap} onFix={() => onFix(gap)} />
            </div>
          ))}
        </div>
      </div>
      <div className="row g-3 mt-3">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">Evidence library</span>
                <h3 className="font-display mb-1">Documents ready to share</h3>
              </div>
              <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onShare}>
                <LockKeyhole /> Share records
              </button>
            </div>
            <div className="d-flex flex-column gap-2 mt-2">
              {evidence.slice(0, 6).map((doc) => (
                <EvidenceDocRow key={doc.id} doc={doc} onOpen={() => onOpenEvidence(doc)} />
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Third-party requests</span>
            <h3 className="font-display mb-1">Who is asking for your records</h3>
            <div className="d-flex flex-column gap-2 mt-2">
              {requests.map((request) => (
                <div className="gm-check-row" key={request.id}>
                  <Mail />
                  <span style={{ flex: 1 }}>
                    <strong>{request.from}</strong>
                    <small>
                      {request.kind} · {request.scope} · {request.requested}
                    </small>
                  </span>
                  <StatusChip
                    label={request.status}
                    tone={
                      request.status === "Answered"
                        ? "low"
                        : request.status === "Open"
                          ? "medium"
                          : "neutral"
                    }
                  />
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => onRespond(request)}
                  >
                    Respond
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-3">
        <div className="col-xl-6">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Retention rules</span>
            <h3 className="font-display mb-1">How long each record is kept</h3>
            <div className="gm-table-wrap mt-2">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Kept for</th>
                    <th>Basis</th>
                    <th>Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {RETENTION_RULES.map((rule) => (
                    <tr key={rule.doc}>
                      <td>{rule.doc}</td>
                      <td className="font-display">{rule.years}</td>
                      <td>{rule.basis}</td>
                      <td>{rule.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Questions we hear weekly</span>
            <h3 className="font-display mb-1">Record-keeping, explained</h3>
            <div className="gm-help mt-2">
              {RECORD_FAQ.map((item) => (
                <details key={item.q} open={faqOpen === item.q}>
                  <summary
                    onClick={(event) => {
                      event.preventDefault();
                      setFaqOpen(faqOpen === item.q ? null : item.q);
                    }}
                  >
                    {item.q}
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <strong className="d-block">Record-keeping health</strong>
            <small className="text-muted">
              Daily reminder at {settingsTimeLabel()}, SMS backup on, retention{" "}
              {"7"} years.
            </small>
          </div>
          <div className="col-md-4 d-flex justify-content-md-end">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onSettings}>
              <Settings2 /> Adjust reminders & sharing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function settingsTimeLabel() {
  return RECORD_SETTINGS.reminderTime;
}

/* ------------------------------------------------------------------- page */

function RecordsPage() {
  const toast = useToast();
  const [view, setView] = useState<RecordView>("diary");
  const [diary, setDiary] = useState<DiaryEntry[]>(DIARY_ENTRIES);
  const [sprays, setSprays] = useState<SprayRecord[]>(SPRAY_RECORDS);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(PURCHASES);
  const [batches, setBatches] = useState<HarvestBatch[]>(HARVEST_BATCHES);
  const [certs, setCerts] = useState<Certification[]>(CERTIFICATIONS);
  const [samples, setSamples] = useState<SoilSample[]>(SOIL_TESTS);
  const [gaps, setGaps] = useState<ComplianceGap[]>(COMPLIANCE_GAPS);
  const [evidence, setEvidence] = useState(EVIDENCE_DOCUMENTS);
  const [requests, setRequests] = useState(RECORD_REQUESTS);
  const [settings, setSettings] = useState(RECORD_SETTINGS);
  const [audits, setAudits] = useState<AuditBooking[]>([]);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<ModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [activeDiary, setActiveDiary] = useState<DiaryEntry | null>(null);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeSpray, setActiveSpray] = useState<SprayRecord | null>(null);
  const [activePurchase, setActivePurchase] = useState<PurchaseRecord | null>(null);
  const [activeBatch, setActiveBatch] = useState<HarvestBatch | null>(null);
  const [activeCert, setActiveCert] = useState<Certification | null>(null);
  const [activeSample, setActiveSample] = useState<SoilSample | null>(null);
  const [activeGap, setActiveGap] = useState<ComplianceGap | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<
    (typeof EVIDENCE_DOCUMENTS)[number] | null
  >(null);
  const [activeRequest, setActiveRequest] = useState<
    (typeof RECORD_REQUESTS)[number] | null
  >(null);
  const [diaryDate, setDiaryDate] = useState("2026-09-20");

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);
  const totals = recordTotals();

  const openDiary = (entry: DiaryEntry) => {
    setActiveDiary(entry);
    setDrawer("diary");
  };

  const previousSample = activeSample
    ? samples.find(
        (sample) =>
          sample.plot === activeSample.plot && sample.iso < activeSample.iso,
      ) ?? null
    : null;

  const kpis: RecordKpi[] = [
    {
      icon: ClipboardList,
      label: "Diary entries",
      value: String(diary.length),
      note: `${diary.filter((entry) => entry.type === "Problem").length} problem entries flagged`,
    },
    {
      icon: Sprout,
      label: "Spray applications",
      value: String(sprays.length),
      note: `${sprays.filter((record) => record.status === "Complete").length} complete, ${sprays.filter((record) => record.status === "Incomplete").length} to fix`,
    },
    {
      icon: QrCode,
      label: "Batch passports",
      value: String(batches.length),
      note: `${totals.qrScans} buyer QR scans`,
    },
    {
      icon: FileText,
      label: "Evidence documents",
      value: String(evidence.length),
      note: `${evidence.filter((doc) => doc.verified).length} verified for audit`,
    },
  ];

  const goTo = (next: RecordView, message: string) => {
    setView(next);
    toast.notify(message, "info");
  };

  return (
    <main className="gm-app-page gm-records-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Manage</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Records & compliance</strong>
          </div>
          <div className="gm-menu-wrap">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setMenu((current) => !current)}
              aria-expanded={menu}
            >
              <MoreHorizontal /> More record tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-finance-menu">
                <button
                  type="button"
                  onClick={() => {
                    openModal("export");
                    setMenu(false);
                  }}
                >
                  <Download /> Export compliance pack
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("share");
                    setMenu(false);
                  }}
                >
                  <LockKeyhole /> Share records with a third party
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("settings");
                    setMenu(false);
                  }}
                >
                  <Settings2 /> Record-keeping settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("audit-book");
                    setMenu(false);
                  }}
                >
                  <CalendarClock /> Book an audit visit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setMenu(false);
                    toast.notify("Printing the record book as it appears on screen.", "info");
                  }}
                >
                  <Printer /> Print this page
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <Reveal>
          <RecordsHero
            kpis={kpis}
            score={RECORD_CONTEXT.complianceScore}
            alerts={[
              { label: `${gaps.length} open gaps`, tone: "medium" },
              { label: "SR-012 blocked · PPE + wind", tone: "high" },
              { label: "KS1758 water test missing", tone: "high" },
              { label: "Audit window 02 – 20 Nov 2026", tone: "low" },
            ]}
            actions={
              <>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("diary-new")}
                >
                  <Plus /> New diary entry
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-gold"
                  onClick={() => openModal("spray-new")}
                >
                  <Sprout /> Log a spray
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => openModal("batch-new")}
                >
                  <QrCode /> Create a batch
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => openModal("soil-new")}
                >
                  <FlaskConical /> Log a soil test
                </button>
              </>
            }
          />
        </Reveal>

        <div className="gm-card p-2 mt-3">
          <PlannerSubtabs
            label="Records sections"
            value={view}
            onChange={(next) => setView(next as RecordView)}
            items={[
              { id: "diary", label: "Farm diary", icon: <ClipboardList />, count: diary.length },
              { id: "spray", label: "Spray record", icon: <Sprout />, count: sprays.length },
              { id: "purchases", label: "Purchases", icon: <Table2 />, count: purchases.length },
              { id: "batches", label: "Batches", icon: <QrCode />, count: batches.length },
              { id: "certification", label: "Certification", icon: <ShieldCheck />, count: certs.length },
              { id: "soil", label: "Soil tests", icon: <FlaskConical />, count: samples.length },
              { id: "compliance", label: "Compliance centre", icon: <BadgeCheck />, count: gaps.length },
            ]}
          />
        </div>

        {view === "diary" ? (
          <DiarySection
            entries={diary}
            onNew={() => {
              setEditingDiary(null);
              setDiaryDate("2026-09-20");
              openModal("diary-new");
            }}
            onOpen={openDiary}
            onEdit={(entry) => {
              setEditingDiary(entry);
              openModal("diary-edit");
            }}
            onPhoto={(photo) => {
              setActivePhoto(photo);
              openModal("photo");
            }}
            toastNote={(entry) =>
              toast.notify(
                `${entry.date} entry saved to the compliance pack · ${entry.type.toLowerCase()}.`,
                "success",
              )
            }
          />
        ) : null}

        {view === "spray" ? (
          <SpraySection
            records={sprays}
            onNew={() => openModal("spray-new")}
            onOpen={(record) => {
              setActiveSpray(record);
              openModal("spray-detail");
            }}
            onComplete={(record) => {
              setSprays((current) =>
                current.map((item) =>
                  item.id === record.id
                    ? {
                        ...item,
                        status: "Complete",
                        notes: `${item.notes} Calibration ${"1.2 L/min"} and product expiry photo logged on 20 Sep 2026.`,
                      }
                    : item,
                ),
              );
              setGaps((current) => current.filter((gap) => gap.id !== "gap-1"));
              toast.notify(`${record.code} completed — the compliance flag is cleared.`, "success");
            }}
            onCorrective={(record) => {
              setActiveSpray(record);
              openModal("corrective");
            }}
          />
        ) : null}

        {view === "purchases" ? (
          <PurchaseSection
            purchases={purchases}
            onNew={() => openModal("purchase-new")}
            onOpen={(record) => {
              setActivePurchase(record);
              openModal("receipt");
            }}
            onQuerySupplier={(record) =>
              toast.notify(
                `Supplier query drafted for ${record.supplier} (${record.supplierPhone}) about ${record.invoiceNo}.`,
                "info",
              )
            }
          />
        ) : null}

        {view === "batches" ? (
          <BatchSection
            batches={batches}
            onNew={() => openModal("batch-new")}
            onTrace={(batch) => {
              setActiveBatch(batch);
              openModal("batch-trace");
            }}
            onShare={(batch) => {
              setActiveBatch(batch);
              openModal("batch-share");
            }}
            onDelivery={(batch) => {
              setActiveBatch(batch);
              openModal("batch-delivery");
            }}
            toastNote={(batch) =>
              toast.notify(
                `${batch.batchId} trace sheet added to the compliance pack.`,
                "success",
              )
            }
          />
        ) : null}

        {view === "certification" ? (
          <CertificationSection
            certs={certs}
            audits={audits}
            onOpenWizard={(cert) => {
              setActiveCert(cert);
              openModal("cert-wizard");
            }}
            onOpenChecklist={(cert) => {
              setActiveCert(cert);
              openModal("cert-checklist");
            }}
            onBookAudit={() => openModal("audit-book")}
            onCertDetails={(cert) => {
              setActiveCert(cert);
              setDrawer("certification");
            }}
          />
        ) : null}

        {view === "soil" ? (
          <SoilSection
            samples={samples}
            onNew={() => openModal("soil-new")}
            onOpen={(sample) => {
              setActiveSample(sample);
              openModal("soil-report");
            }}
            onFollowUp={(sample) =>
              toast.notify(
                `Follow-up action logged for ${sample.plot}: ${sample.recommendation}.`,
                "success",
              )
            }
          />
        ) : null}

        {view === "compliance" ? (
          <ComplianceSection
            gaps={gaps}
            score={RECORD_CONTEXT.complianceScore + (COMPLIANCE_GAPS.length - gaps.length) * 2}
            evidence={evidence}
            requests={requests}
            onFix={(gap) => {
              setActiveGap(gap);
              openModal("gap-fix");
            }}
            onOpenEvidence={(doc) => {
              setActiveEvidence(doc);
              openModal("evidence");
            }}
            onRespond={(request) => {
              setActiveRequest(request);
              openModal("request");
            }}
            onExport={() => openModal("export")}
            onShare={() => openModal("share")}
            onActivity={(month) => {
              const row = RECORD_ACTIVITY.find((item) => item.month === month);
              if (!row) return;
              toast.notify(
                `${row.month}: ${row.diary} diary entries, ${row.sprays} sprays, ${row.purchases} purchases, ${row.batches} batches.`,
                "info",
              );
            }}
            onSettings={() => openModal("settings")}
          />
        ) : null}

        <div className="gm-card p-3 mt-3">
          <div className="row g-3 align-items-center">
            <div className="col-lg-8">
              <span className="gm-eyebrow">Connected records</span>
              <h3 className="font-display mb-1">
                Records do not stand alone — they feed the rest of the farm
              </h3>
              <p className="text-muted mb-0">
                Spray costs land in finance, batch quantities raise harvest notes,
                soil results move the fertilizer plan and certification gaps appear
                in the advisor feed.
              </p>
            </div>
            <div className="col-lg-4">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <button
                  type="button"
                  className="gm-btn gm-btn-soft"
                  onClick={() => goTo("compliance", "Compliance centre opened from the record links.")}
                >
                  <ShieldCheck /> Compliance centre
                </button>
                <Link to="/app/finance" className="gm-btn gm-btn-outline">
                  <BarChart3 /> Finance
                </Link>
                <Link to="/app/advisor" className="gm-btn gm-btn-outline">
                  <Sparkles /> AI advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ drawers */}
      <DashboardDrawer
        open={drawer === "diary"}
        title="Diary entry"
        onClose={() => setDrawer(null)}
        footer={
          activeDiary ? (
            <>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => {
                  setEditingDiary(activeDiary);
                  setDrawer(null);
                  openModal("diary-edit");
                }}
              >
                <Pencil /> Edit entry
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-danger-soft"
                onClick={() => {
                  setDrawer(null);
                  openModal("diary-delete");
                }}
              >
                <Trash2 /> Delete
              </button>
            </>
          ) : null
        }
      >
        {activeDiary ? (
          <>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <StatusChip label={activeDiary.type} tone={activeDiary.type === "Problem" ? "high" : "neutral"} />
              <span className="gm-eyebrow mb-0">{activeDiary.date}</span>
            </div>
            <p style={{ fontSize: "0.92rem" }}>{activeDiary.content}</p>
            <RecordKvList
              rows={[
                { label: "Crop", value: `${activeDiary.crop} · ${activeDiary.variety}` },
                { label: "Plot & location", value: `${activeDiary.plot} · ${activeDiary.location}` },
                { label: "Weather", value: activeDiary.weather },
                { label: "Recorded by", value: activeDiary.author },
                { label: "Tags", value: activeDiary.tags.length ? activeDiary.tags.map((tag) => `#${tag}`).join(" ") : "—" },
                { label: "Linked record", value: activeDiary.linked || "No linked spray or purchase" },
              ]}
            />
            {activeDiary.photos.length ? (
              <div className="mt-3">
                <span className="gm-eyebrow">Photo evidence</span>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {activeDiary.photos.map((photo) => (
                    <button
                      type="button"
                      key={photo}
                      className="gm-filter-chip"
                      onClick={() => {
                        setActivePhoto(photo);
                        openModal("photo");
                      }}
                    >
                      <Camera /> {photo}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted mt-3">No photo attached to this entry.</p>
            )}
          </>
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "batch"}
        title="Batch passport"
        onClose={() => setDrawer(null)}
        footer={
          activeBatch ? (
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  setDrawer(null);
                  openModal("batch-share");
                }}
              >
                <Printer /> Share passport
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => {
                  setDrawer(null);
                  openModal("batch-trace");
                }}
              >
                <QrCode /> Full passport
              </button>
            </>
          ) : null
        }
      >
        {activeBatch ? (
          <>
            <QrTile
              seed={activeBatch.batchId.length * 11 + activeBatch.gradeA}
              label={`QR for ${activeBatch.batchId}`}
              size={150}
            />
            <div className="text-center mt-2 mb-3">
              <strong className="font-display d-block">{activeBatch.batchId}</strong>
              <small className="text-muted">
                {activeBatch.crop} — {activeBatch.variety} · {activeBatch.quantity}
              </small>
            </div>
            <TraceTimeline batch={activeBatch} />
          </>
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "certification"}
        title="Certification details"
        onClose={() => setDrawer(null)}
        footer={
          activeCert ? (
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  setDrawer(null);
                  openModal("cert-wizard");
                }}
              >
                <ShieldCheck /> Continue this certification
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => {
                  setDrawer(null);
                  openModal("cert-checklist");
                }}
              >
                <ClipboardCheck /> Checklist
              </button>
            </>
          ) : null
        }
      >
        {activeCert ? (
          <>
            <span className="gm-eyebrow">{activeCert.body}</span>
            <h3 className="font-display">{activeCert.name}</h3>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <StatusChip label={activeCert.status} tone={certTone(activeCert.status)} />
              <StatusChip label={`${activeCert.progress}% complete`} tone="neutral" />
              <StatusChip label={`Due ${activeCert.dueDate}`} tone="medium" />
            </div>
            <p className="text-muted">{activeCert.requirements}</p>
            <RecordKvList
              rows={[
                { label: "Auditor", value: activeCert.auditor },
                { label: "Scope", value: activeCert.scope },
                { label: "Fee", value: activeCert.fee ? kes(activeCert.fee) : "No fee at this stage" },
                { label: "Documents", value: `${activeCert.documents.length} on file` },
              ]}
            />
            <div className="mt-3">
              <span className="gm-eyebrow">Documents</span>
              <div className="d-flex flex-column gap-2 mt-2">
                {activeCert.documents.length === 0 ? (
                  <p className="text-muted mb-0">No documents required at this stage.</p>
                ) : (
                  activeCert.documents.map((doc) => (
                    <div className="gm-check-row" key={doc.name}>
                      <FileText />
                      <span style={{ flex: 1 }}>
                        <strong>{doc.name}</strong>
                        <small>updated {doc.updated}</small>
                      </span>
                      <StatusChip
                        label={doc.status}
                        tone={
                          doc.status === "Verified"
                            ? "low"
                            : doc.status === "Missing"
                              ? "high"
                              : "medium"
                        }
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}
      </DashboardDrawer>

      {/* ------------------------------------------------------------- modals */}
      <DiaryWizard
        open={modal === "diary-new"}
        defaultDate={diaryDate}
        onClose={closeModal}
        onSave={(entry) => {
          setDiary((current) => [entry, ...current]);
          setGaps((current) => current.filter((gap) => gap.id !== "gap-5"));
          toast.notify(`Diary entry saved for ${entry.date}.`, "success");
        }}
      />
      <DiaryWizard
        open={modal === "diary-edit"}
        editing={editingDiary}
        onClose={closeModal}
        onSave={(entry) => {
          setDiary((current) =>
            current.map((item) => (item.id === entry.id ? entry : item)),
          );
          setActiveDiary(entry);
          toast.notify(`Diary entry for ${entry.date} updated.`, "success");
        }}
      />
      <ConfirmRecordDialog
        open={modal === "diary-delete"}
        title="Delete this diary entry?"
        body={
          activeDiary
            ? `${activeDiary.date} — ${activeDiary.type}. Deleting removes it from the compliance pack, but the deletion itself stays in the audit log.`
            : "This entry will be removed from the record book."
        }
        confirmLabel="Delete entry"
        onClose={closeModal}
        onConfirm={() => {
          if (!activeDiary) return;
          setDiary((current) => current.filter((item) => item.id !== activeDiary.id));
          toast.notify(`Diary entry for ${activeDiary.date} deleted.`, "warn");
        }}
      />
      <PhotoViewerDialog
        photo={activePhoto}
        onClose={() => setActivePhoto(null)}
        onAttach={(photo) =>
          toast.notify(`${photo} attached to the compliance pack.`, "success")
        }
      />
      <SprayWizard
        open={modal === "spray-new"}
        onClose={closeModal}
        onSave={(record) => {
          setSprays((current) => [record, ...current]);
          setDiary((current) => [
            {
              id: `d-spray-${Date.now()}`,
              date: record.date,
              iso: record.iso,
              type: "Input use",
              content: `Sprayed ${record.product} (${record.rate}) for ${record.target} on ${record.plot}. Volume ${record.volumeMixed} over ${record.areaTreated}.`,
              crop: record.crop,
              variety: record.variety,
              plot: record.plot,
              location: record.plot,
              weather: `${record.wind}, ${record.temp}`,
              author: record.applicator,
              photos: [],
              tags: ["spray"],
              linked: record.code,
            },
            ...current,
          ]);
          toast.notify(
            `${record.code} logged · next safe harvest ${record.nextSafeHarvest}.`,
            "success",
          );
        }}
      />
      <SprayDetailDialog
        open={modal === "spray-detail"}
        record={activeSpray}
        onClose={closeModal}
        onComplete={(record) => {
          setSprays((current) =>
            current.map((item) =>
              item.id === record.id
                ? { ...item, status: "Complete", notes: `${item.notes} Missing calibration recorded on 20 Sep 2026.` }
                : item,
            ),
          );
          setGaps((current) => current.filter((gap) => gap.id !== "gap-1"));
          toast.notify(`${record.code} is now a complete record.`, "success");
        }}
        onCorrective={(record) => {
          setActiveSpray(record);
          setModal("corrective");
        }}
      />
      <CorrectiveActionWizard
        open={modal === "corrective"}
        record={activeSpray}
        onClose={closeModal}
        onSaved={(summary) => {
          setSprays((current) =>
            current.map((item) =>
              item.id === activeSpray?.id
                ? { ...item, notes: `${item.notes} ${summary}.` }
                : item,
            ),
          );
          setGaps((current) => current.filter((gap) => gap.id !== "gap-2"));
          toast.notify(summary, "success");
        }}
      />
      <PurchaseWizard
        open={modal === "purchase-new"}
        onClose={closeModal}
        onSave={(record) => {
          setPurchases((current) => [record, ...current]);
          toast.notify(
            `${record.input} recorded · ${record.invoiceNo} · ${kes(record.total)}.`,
            "success",
          );
        }}
      />
      <ReceiptViewerDialog
        open={modal === "receipt"}
        record={activePurchase}
        onClose={closeModal}
        onAttach={(id) => {
          setPurchases((current) =>
            current.map((item) => (item.id === id ? { ...item, receipt: true } : item)),
          );
          setGaps((current) => current.filter((gap) => gap.id !== "gap-3"));
          toast.notify("Receipt photo attached to the purchase record.", "success");
        }}
      />
      <BatchWizard
        open={modal === "batch-new"}
        onClose={closeModal}
        onSave={(batch) => {
          setBatches((current) => [batch, ...current]);
          toast.notify(
            `${batch.batchId} created · QR passport ready for ${batch.quantity}.`,
            "success",
          );
        }}
      />
      <BatchTraceDialog
        open={modal === "batch-trace"}
        batch={activeBatch}
        onClose={closeModal}
        onShare={(batch) => {
          setActiveBatch(batch);
          setModal("batch-share");
        }}
      />
      <QrShareDialog
        open={modal === "batch-share"}
        batch={activeBatch}
        onClose={closeModal}
        onShared={(batch, channel) => {
          setBatches((current) =>
            current.map((item) =>
              item.id === batch.id
                ? { ...item, qrScans: item.qrScans + 1 }
                : item,
            ),
          );
          toast.notify(
            `${batch.batchId} passport sent via ${channel} to ${batch.destinationPhone}.`,
            "success",
          );
        }}
      />
      <BatchDeliveryDialog
        open={modal === "batch-delivery"}
        batch={activeBatch}
        onClose={closeModal}
        onConfirmed={(batch, scans) => {
          setBatches((current) =>
            current.map((item) =>
              item.id === batch.id
                ? {
                    ...item,
                    status: "Delivered",
                    qrScans: scans,
                    steps: item.steps.map((step) =>
                      step.label.toLowerCase().includes("deliver") ||
                      step.label.toLowerCase().includes("transit")
                        ? { ...step, done: true }
                        : step,
                    ),
                  }
                : item,
            ),
          );
          setGaps((current) => current.filter((gap) => gap.id !== "gap-6"));
          toast.notify(
            `${batch.batchId} confirmed delivered · ${scans} QR scans.`,
            "success",
          );
        }}
      />
      <CertWizard
        open={modal === "cert-wizard"}
        initial={activeCert}
        onClose={closeModal}
        onSave={(cert, receipt) => {
          setCerts((current) =>
            current.map((item) => (item.id === cert.id ? { ...item, dueDate: cert.dueDate } : item)),
          );
          toast.notify(
            receipt
              ? `${cert.short} fee paid · reference ${receipt}.`
              : `${cert.short} milestone scheduled for ${cert.dueDate}.`,
            "success",
          );
        }}
      />
      <CertChecklistDialog
        open={modal === "cert-checklist"}
        cert={activeCert}
        onClose={closeModal}
        onToggle={(certId, item: CertChecklistItem) => {
          setCerts((current) =>
            current.map((cert) =>
              cert.id === certId
                ? {
                    ...cert,
                    checklist: cert.checklist.map((entry) =>
                      entry.id === item.id ? { ...entry, done: !entry.done } : entry,
                    ),
                    progress: Math.round(
                      (cert.checklist.filter((entry) =>
                        entry.id === item.id ? !entry.done : entry.done,
                      ).length /
                        Math.max(1, cert.checklist.length)) *
                        100,
                    ),
                  }
                : cert,
            ),
          );
        }}
        onAddEvidence={(certId, item) => {
          setCerts((current) =>
            current.map((cert) =>
              cert.id === certId
                ? {
                    ...cert,
                    checklist: cert.checklist.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, evidence: `${entry.evidence} · uploaded 20 Sep 2026` }
                        : entry,
                    ),
                  }
                : cert,
            ),
          );
          toast.notify(`Evidence attached to “${item.label}”.`, "success");
        }}
      />
      <AuditBookingDialog
        open={modal === "audit-book"}
        presetCert={activeCert}
        onClose={closeModal}
        onBooked={(auditorName, date, receipt) => {
          setAudits((current) => [
            { id: `aud-${Date.now()}`, auditor: auditorName, date, receipt: receipt ?? "Free visit" },
            ...current,
          ]);
          toast.notify(`${auditorName} booked for ${date}.`, "success");
        }}
      />
      <SoilTestWizard
        open={modal === "soil-new"}
        onClose={closeModal}
        onSave={(sample) => {
          setSamples((current) => [sample, ...current]);
          setGaps((current) => current.filter((gap) => gap.id !== "gap-7"));
          toast.notify(
            `${sample.plot} soil test saved · pH ${sample.ph.toFixed(1)}.`,
            "success",
          );
        }}
      />
      <SoilReportDialog
        open={modal === "soil-report"}
        sample={activeSample}
        previous={previousSample}
        onClose={closeModal}
        onFollowUp={(sample) =>
          toast.notify(
            `Follow-up logged for ${sample.plot}: ${sample.recommendation}.`,
            "success",
          )
        }
      />
      <ExportPackDialog
        open={modal === "export"}
        onClose={closeModal}
        onExported={(label) => toast.notify(`Compliance pack generated · ${label}.`, "success")}
      />
      <DataShareDialog
        open={modal === "share"}
        onClose={closeModal}
        onShared={(link, days) =>
          toast.notify(`Share link sent · valid ${days} days · ${link}.`, "success")
        }
      />
      <RecordsSettingsDialog
        open={modal === "settings"}
        settings={settings}
        onClose={closeModal}
        onSave={(next) => {
          setSettings(next);
          toast.notify("Record-keeping settings saved.", "success");
        }}
      />
      <GapFixWizard
        open={modal === "gap-fix"}
        gap={activeGap}
        onClose={closeModal}
        onFixed={(gap, note) => {
          setGaps((current) => current.filter((item) => item.id !== gap.id));
          toast.notify(`${gap.title} — closed. ${note}`, "success");
        }}
      />
      <EvidencePackDialog
        open={modal === "evidence"}
        pack={activeEvidence}
        onClose={closeModal}
        onVerify={(id) => {
          setEvidence((current) =>
            current.map((doc) => (doc.id === id ? { ...doc, verified: true } : doc)),
          );
          toast.notify("Evidence pack verified and ready for submission.", "success");
        }}
      />
      <RequestRespondDialog
        open={modal === "request"}
        request={activeRequest}
        onClose={closeModal}
        onResponded={(id, note) => {
          setRequests((current) =>
            current.map((request) =>
              request.id === id ? { ...request, status: "Answered" } : request,
            ),
          );
          toast.notify(`Response sent. ${note}`, "success");
        }}
      />

      <div className="gm-card p-3 mt-4">
        <div className="row g-3 align-items-center">
          <div className="col-lg-9">
            <strong className="d-block mb-1">Record settings in force</strong>
            <small className="text-muted">
              Daily reminder {settings.reminderTime} · PHI alerts{" "}
              {settings.phiAlerts ? "on" : "off"} · SMS backup{" "}
              {settings.smsBackup ? "on" : "off"} · retention {settings.retentionYears} years ·{" "}
              {settings.language}
            </small>
          </div>
          <div className="col-lg-3">
            <Toggle
              checked={settings.phiAlerts}
              onChange={(value) => {
                setSettings({ ...settings, phiAlerts: value });
                toast.notify(`PHI alerts ${value ? "enabled" : "disabled"}.`, "info");
              }}
              label="PHI alerts"
              desc="Block batch labels until spray intervals clear."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
