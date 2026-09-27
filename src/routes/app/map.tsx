import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ClipboardList,
  Compass,
  Footprints,
  Globe,
  Landmark,
  LayoutDashboard,
  Map as MapIcon,
  MapPin,
  Plus,
  Ruler,
  Scale,
  ScanSearch,
  Table2,
  Upload,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  AddPinModal,
  AreaModal,
  CreatePlotWizard,
  DistanceModal,
  EditPlotModal,
  ElevationModal,
  ExportModal,
  FinanceModal,
  HistoryModal,
  InputsModal,
  LabourModal,
  MethodModal,
  type ModalState,
  NotesModal,
  PhotosModal,
  PinDetailModal,
  PlotDashboardDrawer,
  ResolvePinModal,
  SlopeModal,
  SoilModal,
  SoilPointModal,
  SoilTestModal,
  SunModal,
  TasksModal,
  WeatherModal,
} from "../../components/app/MapModals";
import {
  CompareTable,
  FarmMap,
  LayerToggles,
  MapHero,
  PinRow,
  PlotTable,
  ToolCard,
  ViewModeToggle,
} from "../../components/app/MapWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  COMPARE,
  FARM_AVG_COMPARE,
  MAP_ALERTS,
  MAP_CONTEXT,
  MAP_LAYERS,
  type MapLayer,
  type MapView,
  MEASURE_TOOLS,
  PINS,
  PLOTS,
  PLOT_COLORS,
} from "../../data/app/map";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/map")({
  component: MapPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Farm map & plot management — GrowMO" }] }),
});

type MapTab = "overview" | "map" | "plots" | "pins" | "compare" | "measure";

const METHOD_KINDS = ["walk", "tap", "dims", "coords", "upload", "registry"] as const;

function MapPage() {
  const [tab, setTab] = useState<MapTab>("overview");
  const [view, setView] = useState<MapView>("satellite");
  const [layers, setLayers] = useState<MapLayer[]>(MAP_LAYERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  const open = (s: ModalState) => setModal(s);
  const close = () => setModal(null);
  const toggleLayer = (id: string) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, on: !l.on } : l)));
  const activeLayers = layers.filter((l) => l.on).map((l) => l.id);

  const openPlot = (id: string) => {
    setSelectedId(id);
    setModal({ kind: "plot", plotId: id });
  };
  const goCompare = (id: string) => {
    setSelectedId(id);
    setTab("compare");
    setModal(null);
  };

  const totals = {
    budget: PLOTS.reduce((s, p) => s + p.budget, 0),
    spent: PLOTS.reduce((s, p) => s + p.spent, 0),
    tasks: PLOTS.reduce((s, p) => s + p.tasksToday, 0),
  };
  const openPins = PINS.filter((p) => p.status !== "Resolved").length;

  return (
    <main className="gm-app-page gm-map-page">
      <div className="gm-container py-4">
        {/* breadcrumb */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Link to="/app/dashboard" className="gm-back-link">
            Dashboard
          </Link>
          <span className="gm-breadcrumb-sep">/</span>
          <span className="text-muted">Farm</span>
          <span className="gm-breadcrumb-sep">/</span>
          <strong>Farm map &amp; plots</strong>
          <StatusChip label="SR 2026 · Tue 17/11" tone="neutral" />
        </div>

        <MapHero onExport={() => open({ kind: "export" })} />

        <PlannerSubtabs<MapTab>
          value={tab}
          onChange={setTab}
          label="Farm map sections"
          items={[
            { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
            { id: "map", label: "Interactive map", icon: <MapIcon size={14} /> },
            { id: "plots", label: "Plots", icon: <Table2 size={14} /> },
            { id: "pins", label: "Problem pins", icon: <MapPin size={14} />, count: PINS.length },
            { id: "compare", label: "Compare", icon: <Scale size={14} /> },
            { id: "measure", label: "Measure", icon: <Ruler size={14} /> },
          ]}
        />

        {/* ============ OVERVIEW (19.4) ============ */}
        {tab === "overview" && (
          <div>
            <div className="gm-statgrid">
              <DashboardMetric
                icon={MapIcon}
                label="Plots under management"
                value="4"
                note={`${MAP_CONTEXT.farmAreaAc} ac · ${MAP_CONTEXT.farmAreaHa} ha · 4 active crops`}
              />
              <DashboardMetric
                icon={ClipboardList}
                label="Tasks open today"
                value={String(totals.tasks)}
                note="Cabbage D24 · Maize D10 · Sukuma harvest"
              />
              <DashboardMetric
                icon={Wallet}
                label="Season budget → spent"
                value={kes(totals.budget)}
                note={`${kes(totals.spent)} spent · ${kes(totals.budget - totals.spent)} to go`}
              />
              <DashboardMetric
                icon={MapPin}
                label="Problem pins"
                value={String(PINS.length)}
                note={`${openPins} open · ${PINS.length - openPins} resolved this season`}
              />
            </div>

            <div className="gm-map-overview-grid">
              <section className="gm-card">
                <DashboardSectionHeader
                  eyebrow="Multi-plot overview"
                  title="Every plot, one table"
                  subtitle="Crop, stage, health and money — tap a row for the full plot dashboard."
                  action={
                    <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "create" })}>
                      New plot
                    </button>
                  }
                />
                <PlotTable onOpen={openPlot} onCompare={goCompare} onEdit={(id) => open({ kind: "edit-plot", plotId: id })} />
              </section>

              <div className="gm-map-overview-side">
                <section className="gm-card">
                  <DashboardSectionHeader eyebrow="Watch list" title="Map alerts" />
                  <ul className="gm-alert-list">
                    {MAP_ALERTS.map((a) => (
                      <li key={a.id} className={`gm-alert ${a.tone}`}>
                        <StatusChip label={a.tone === "warn" ? "Watch" : a.tone === "info" ? "Info" : "OK"} tone={a.tone === "warn" ? "medium" : a.tone === "info" ? "neutral" : "low"} />
                        <span>{a.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="gm-card">
                  <DashboardSectionHeader eyebrow="Quick actions" title="Do it from here" />
                  <div className="gm-quickgrid">
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "add-pin" })}>
                      <MapPin size={14} /> Pin a problem
                    </button>
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "soil-test" })}>
                      <Compass size={14} /> Request soil test
                    </button>
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "distance" })}>
                      <Ruler size={14} /> Measure distance
                    </button>
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "export" })}>
                      <ScanSearch size={14} /> Export report
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* ============ INTERACTIVE MAP (19.1) ============ */}
        {tab === "map" && (
          <div className="gm-map-layout">
            <section className="gm-card gm-map-card">
              <div className="gm-map-toolbar">
                <ViewModeToggle view={view} onChange={setView} />
                <div className="gm-map-capture">
                  <span className="gm-map-capture-label">Capture a new plot:</span>
                  <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "create" })}>
                    <Plus size={14} /> New plot
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" title="Walk the boundary (±2 m)" onClick={() => open({ kind: "walk" })}>
                    <Footprints size={14} /> Walk
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" title="Tap points (±3 m)" onClick={() => open({ kind: "tap" })}>
                    <ScanSearch size={14} /> Tap
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" title="Enter dimensions (±1 m)" onClick={() => open({ kind: "dims" })}>
                    <Ruler size={14} /> Dimensions
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" title="GPS coordinates (±5 m)" onClick={() => open({ kind: "coords" })}>
                    <Globe size={14} /> GPS
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" title="Upload GeoJSON / KML (±0.1 m)" onClick={() => open({ kind: "upload" })}>
                    <Upload size={14} /> Survey file
                  </button>
                  <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" title="Land registry by title number (exact)" onClick={() => open({ kind: "registry" })}>
                    <Landmark size={14} /> Registry
                  </button>
                </div>
              </div>
              <FarmMap
                view={view}
                layers={activeLayers}
                selectedId={selectedId}
                onPlotOpen={openPlot}
                onPinOpen={(id) => open({ kind: "pin", pinId: id })}
                onSoilOpen={(id) => open({ kind: "soil-point", soilId: id })}
                onMapTap={() => open({ kind: "add-pin" })}
              />
              <p className="gm-map-foot">
                Tap any plot for its dashboard · tap a pin or soil point for details · tap empty
                ground to pin a problem · scale 1 px ≈ 0.525 m
              </p>
            </section>

            <aside className="gm-map-side">
              <section className="gm-card">
                <LayerToggles layers={layers} onToggle={toggleLayer} />
              </section>
              <section className="gm-card">
                <h3 className="gm-card-h">Legend</h3>
                <div className="gm-legend">
                  {PLOTS.map((p) => (
                    <span key={p.id} className="gm-legend-item">
                      <i className={`gm-dot gm-dot-${p.color}`} /> {p.id} · {p.name}
                    </span>
                  ))}
                  <span className="gm-legend-item">
                    <i className="gm-legend-soil" /> Soil sample point (6)
                  </span>
                  <span className="gm-legend-item">
                    <i className="gm-legend-pin" /> Problem pin ({PINS.length})
                  </span>
                  <span className="gm-legend-item">
                    <i className="gm-legend-water" /> Stream · borehole · drip lines
                  </span>
                  <span className="gm-legend-item">
                    <i className="gm-legend-tree" /> Tree · house · store · nursery
                  </span>
                </div>
              </section>
              {selectedId ? (
                <section className="gm-card">
                  <h3 className="gm-card-h">Selected plot</h3>
                  {(() => {
                    const p = PLOTS.find((x) => x.id === selectedId);
                    if (!p) return null;
                    return (
                      <>
                        <p className="mb-1">
                          <strong>{p.id} · {p.name}</strong>
                          <br />
                          <span className="text-muted">
                            {p.crop} · {p.areaAc} ac · health {p.health}/100
                          </span>
                        </p>
                        <div className="gm-quickgrid">
                          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => openPlot(p.id)}>
                            Dashboard
                          </button>
                          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "edit-plot", plotId: p.id })}>
                            Edit
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </section>
              ) : null}
              <section className="gm-card">
                <h3 className="gm-card-h">Open problem pins</h3>
                {PINS.filter((p) => p.status !== "Resolved").map((p) => (
                  <PinRow key={p.id} pin={p} onOpen={() => open({ kind: "pin", pinId: p.id })} onResolve={() => open({ kind: "resolve-pin", pinId: p.id })} />
                ))}
              </section>
            </aside>
          </div>
        )}

        {/* ============ PLOTS (19.2 + 19.4) ============ */}
        {tab === "plots" && (
          <div>
            <section className="gm-card">
              <DashboardSectionHeader
                eyebrow="Plot creation & management"
                title="The plot register"
                subtitle="Create plots by walking, tapping, dimensions, GPS, survey file or the land registry — every boundary lands here."
                action={
                  <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "create" })}>
                    New plot
                  </button>
                }
              />
              <PlotTable onOpen={openPlot} onCompare={goCompare} onEdit={(id) => open({ kind: "edit-plot", plotId: id })} />
              <div className="gm-legend mt-3">
                {PLOT_COLORS.map((c) => (
                  <span key={c.id} className="gm-legend-item">
                    <i className={`gm-dot gm-dot-${c.id}`} /> {c.label}
                  </span>
                ))}
                <span className="gm-legend-item gm-legend-note">
                  New plots continue from PL-05. Edits never change the recorded boundary.
                </span>
              </div>
            </section>
          </div>
        )}

        {/* ============ PINS (19.5) ============ */}
        {tab === "pins" && (
          <div>
            <section className="gm-card">
              <DashboardSectionHeader
                eyebrow="Problem pinning"
                title="Pinned hotspots"
                subtitle="Tap a spot on the map when something looks off — severity, status and the fix are kept with the location."
                action={
                  <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "add-pin" })}>
                    Pin a problem
                  </button>
                }
              />
              <div className="gm-chiprow">
                <StatusChip label={`${PINS.filter((p) => p.status === "Monitoring").length} monitoring`} tone="medium" />
                <StatusChip label={`${PINS.filter((p) => p.status === "Action pending").length} action pending`} tone="high" />
                <StatusChip label={`${PINS.filter((p) => p.status === "Resolved").length} resolved`} tone="low" />
              </div>
              <div className="gm-pinrows">
                {PINS.map((p) => (
                  <PinRow key={p.id} pin={p} onOpen={() => open({ kind: "pin", pinId: p.id })} onResolve={() => open({ kind: "resolve-pin", pinId: p.id })} />
                ))}
              </div>
              <div className="gm-table-wrap mt-3">
                <table className="gm-table gm-table-sm">
                  <caption className="gm-table-caption">Pin log — full record</caption>
                  <thead>
                    <tr>
                      <th>Pin</th>
                      <th>Plot</th>
                      <th>Location</th>
                      <th>Issue</th>
                      <th>Pinned</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Action taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PINS.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        <td>{p.plotId}</td>
                        <td>{p.location}</td>
                        <td>{p.issue}</td>
                        <td>{p.date}</td>
                        <td>
                          <StatusChip
                            label={p.severity}
                            tone={p.severity === "High" ? "high" : p.severity === "Medium" ? "medium" : "low"}
                          />
                        </td>
                        <td>
                          <StatusChip label={p.status} tone={p.status === "Resolved" ? "low" : "medium"} />
                        </td>
                        <td>{p.action ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ============ COMPARE (19.6) ============ */}
        {tab === "compare" && (
          <div>
            <section className="gm-card">
              <DashboardSectionHeader
                eyebrow="Plot comparison analytics"
                title="Same season, side by side"
                subtitle="Cost per acre, estimated revenue per acre and return — the numbers that decide next season's layout."
                action={
                  <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "export" })}>
                    Export the table
                  </button>
                }
              />
              <CompareTable rows={COMPARE} avg={FARM_AVG_COMPARE} onOpen={openPlot} />
              <p className="gm-muted mt-2 mb-0">
                Farm average {kes(FARM_AVG_COMPARE.costAc)}/acre in and {kes(FARM_AVG_COMPARE.revAc)}/acre
                out at a {FARM_AVG_COMPARE.roi} return, weighted by plot size. Plot 4 is a
                household plot — its 25% return is food security, not profit. Soil score blends
                the latest lab test (pH, N, P, K, organic matter) with trend direction.
              </p>
            </section>
          </div>
        )}

        {/* ============ MEASURE (19.7) ============ */}
        {tab === "measure" && (
          <div>
            <section className="gm-card">
              <DashboardSectionHeader
                eyebrow="Measurement tools"
                title="Take it to the ground"
                subtitle="Five tools on the same 1 px ≈ 0.525 m survey grid — distances, areas, elevation, slope and sun."
              />
              <div className="gm-toolgrid">
                {MEASURE_TOOLS.map((t) => (
                  <ToolCard key={t.id} tool={t} onUse={() => open({ kind: t.kind })} />
                ))}
              </div>
              <p className="gm-muted mt-2 mb-0">
                Every tool reads the 2024 digital survey (title GTH/1234).
                Elevation band {MAP_CONTEXT.elevationBand}; the steepest line on the farm is the
                stream edge at 6%.
              </p>
            </section>
          </div>
        )}
      </div>

      {/* ============ MODALS (29 kinds) ============ */}
      {modal?.kind === "plot" && (
        <PlotDashboardDrawer open state={modal} onClose={close} onOpen={open} onCompare={goCompare} />
      )}
      {modal?.kind === "create" && <CreatePlotWizard state={modal} onClose={close} />}
      {modal && (METHOD_KINDS as readonly string[]).includes(modal.kind) && (
        <MethodModal state={modal} onClose={close} onOpen={open} />
      )}
      {modal?.kind === "edit-plot" && <EditPlotModal state={modal} onClose={close} />}
      {modal?.kind === "add-pin" && <AddPinModal state={modal} onClose={close} />}
      {modal?.kind === "pin" && <PinDetailModal state={modal} onClose={close} onOpen={open} />}
      {modal?.kind === "resolve-pin" && <ResolvePinModal state={modal} onClose={close} />}
      {modal?.kind === "weather" && <WeatherModal state={modal} onClose={close} />}
      {modal?.kind === "soil" && <SoilModal state={modal} onClose={close} onOpen={open} />}
      {modal?.kind === "soil-point" && <SoilPointModal state={modal} onClose={close} onOpen={open} />}
      {modal?.kind === "soil-test" && <SoilTestModal state={modal} onClose={close} />}
      {modal?.kind === "tasks" && <TasksModal state={modal} onClose={close} />}
      {modal?.kind === "labour" && <LabourModal state={modal} onClose={close} />}
      {modal?.kind === "inputs" && <InputsModal state={modal} onClose={close} />}
      {modal?.kind === "finance" && <FinanceModal state={modal} onClose={close} />}
      {modal?.kind === "photos" && <PhotosModal state={modal} onClose={close} />}
      {modal?.kind === "history" && <HistoryModal state={modal} onClose={close} />}
      {modal?.kind === "notes" && <NotesModal state={modal} onClose={close} />}
      {modal?.kind === "distance" && <DistanceModal state={modal} onClose={close} />}
      {modal?.kind === "area" && <AreaModal state={modal} onClose={close} />}
      {modal?.kind === "elevation" && <ElevationModal state={modal} onClose={close} />}
      {modal?.kind === "slope" && <SlopeModal state={modal} onClose={close} />}
      {modal?.kind === "sun" && <SunModal state={modal} onClose={close} />}
      {modal?.kind === "export" && <ExportModal state={modal} onClose={close} />}
    </main>
  );
}
