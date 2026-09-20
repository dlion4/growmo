/* ============================================================================
   PAGE 8 — WEATHER & CLIMATE INTELLIGENCE (ENHANCED)  (/app/weather)

   Blueprint sections implemented:
   8.1 Current conditions       8.2 Detailed 7-day forecast
   8.3 Seasonal forecast        8.4 Crop-specific prediction engine
   8.5 Planting window advisor  8.6 Extreme weather alerts
   8.7 Historical weather data

   Weather is presented as farm action: every forecast, risk and alert can open
   a useful workflow, create a field plan, acknowledge a warning or download a
   report. The data is an explicitly labelled planning simulation.
   ========================================================================== */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarDays,
  CloudRain,
  CloudSun,
  Download,
  Eye,
  Gauge,
  History,
  Leaf,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sprout,
  Wind,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { TrendChart } from "../../components/app/InventoryWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  AlertDialog,
  type AlertRuleDraft,
  ConfirmWeatherDialog,
  CreateAlertWizard,
  ForecastDayDialog,
  HistoricalMonthDialog,
  HistoryCompareDialog,
  type IrrigationPlan,
  IrrigationWizard,
  LocationDialog,
  MetricDialog,
  PlantingWindowDialog,
  type PredictionDraft,
  PredictionPeriodDialog,
  PredictionWizard,
  PreferencesDialog,
  RefreshStationDialog,
  ReportExportDialog,
  SeasonalOutlookDialog,
  SeasonalRiskDialog,
  ShareAdvisoryDialog,
  SourcesDialog,
  type SprayPlan,
  SprayWindowWizard,
  WindowAdvisorWizard,
} from "../../components/app/WeatherModals";
import {
  AlertCard,
  CurrentConditionsCard,
  ForecastDayCard,
  HistoricalWeatherChart,
  PredictionTimeline,
  SeasonalRiskCard,
  WeatherHeaderCard,
  WeatherRadarCard,
} from "../../components/app/WeatherWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  alertTone,
  CROP_WEATHER_PLANS,
  type CropPredictionPeriod,
  CURRENT_WEATHER_METRICS,
  type CurrentWeatherMetric,
  EXTREME_ALERTS,
  type ExtremeWeatherAlert,
  FORECAST_7_DAYS,
  HISTORICAL_WEATHER,
  type HistoricalWeatherMonth,
  PLANTING_WINDOWS,
  type PlantingWindow,
  SEASONAL_OUTLOOK,
  SEASONAL_RISKS,
  type SeasonalRisk,
  WEATHER_CONTEXT,
  WEATHER_LOCATIONS,
  WEATHER_PREFERENCES,
  WEATHER_SOURCES,
  type WeatherAlertStatus,
  type WeatherForecastDay,
  type WeatherLocation,
  type WeatherPreferences,
} from "../../data/app/weather";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/weather")({
  component: WeatherClimatePage,
});

type WeatherView =
  | "today"
  | "forecast"
  | "seasonal"
  | "predictions"
  | "windows"
  | "alerts"
  | "history";
type ModalId =
  | "location"
  | "metric"
  | "forecast-day"
  | "sources"
  | "refresh"
  | "seasonal"
  | "seasonal-risk"
  | "prediction-create"
  | "prediction-period"
  | "window"
  | "window-advisor"
  | "alert"
  | "alert-create"
  | "history-month"
  | "history-compare"
  | "report"
  | "preferences"
  | "irrigation"
  | "spray"
  | "share"
  | "delete-alert"
  | null;

interface WeatherTask {
  id: string;
  title: string;
  date: string;
  detail: string;
  kind: "Irrigation" | "Spray" | "Scout" | "Response";
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

function weatherTask(
  kind: WeatherTask["kind"],
  title: string,
  date: string,
  detail: string,
): WeatherTask {
  return { id: `weather-task-${Date.now()}`, kind, title, date, detail };
}

function WeatherClimatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [view, setView] = useState<WeatherView>("today");
  const [location, setLocation] = useState<WeatherLocation>(
    WEATHER_LOCATIONS[0],
  );
  const [forecast] = useState<WeatherForecastDay[]>(FORECAST_7_DAYS);
  const [alerts, setAlerts] = useState<ExtremeWeatherAlert[]>(EXTREME_ALERTS);
  const [preferences, setPreferences] =
    useState<WeatherPreferences>(WEATHER_PREFERENCES);
  const [seasonalSubscribed, setSeasonalSubscribed] = useState(false);
  const [tasks, setTasks] = useState<WeatherTask[]>([
    weatherTask(
      "Scout",
      "Inspect cabbage lower leaves for black rot",
      "Today · 16:30",
      "Walk Plot 1 after the rain dries.",
    ),
    weatherTask(
      "Irrigation",
      "Check soil probe before irrigation",
      "16 Nov · 06:30",
      "Only irrigate if moisture falls below 55%.",
    ),
    weatherTask(
      "Response",
      "Secure greenhouse structure",
      "Tomorrow · 17:00",
      "Wind warning: inspect ties and plastic edges.",
    ),
  ]);
  const [customAlertRules, setCustomAlertRules] = useState<AlertRuleDraft[]>(
    [],
  );
  const [irrigationPlans, setIrrigationPlans] = useState<IrrigationPlan[]>([]);
  const [sprayPlans, setSprayPlans] = useState<SprayPlan[]>([]);
  const [menu, setMenu] = useState(false);
  const [locationDrawer, setLocationDrawer] = useState(false);
  const [modal, setModal] = useState<ModalId>(null);
  const [selectedMetric, setSelectedMetric] =
    useState<CurrentWeatherMetric | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeatherForecastDay | null>(
    null,
  );
  const [selectedRisk, setSelectedRisk] = useState<SeasonalRisk | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<CropPredictionPeriod | null>(null);
  const [predictionDraft, setPredictionDraft] =
    useState<PredictionDraft | null>(null);
  const [windowShortlist, setWindowShortlist] = useState<string[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<PlantingWindow | null>(
    null,
  );
  const [selectedAlert, setSelectedAlert] =
    useState<ExtremeWeatherAlert | null>(null);
  const [selectedMonth, setSelectedMonth] =
    useState<HistoricalWeatherMonth | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("plan-cabbage");
  const [search, setSearch] = useState("");
  const [countyFilter, setCountyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<WeatherAlertStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);
  const selectedPlan =
    CROP_WEATHER_PLANS.find((plan) => plan.id === selectedPlanId) ??
    CROP_WEATHER_PLANS[0];
  const activeAlerts = alerts.filter((alert) => alert.status === "Active");
  const plannedActions = irrigationPlans.length + sprayPlans.length;

  const notify = (
    message: string,
    kind: "success" | "info" | "warn" = "success",
  ) => toast.notify(message, kind);
  const addTask = (task: WeatherTask) =>
    setTasks((current) => [task, ...current]);

  const handleLocation = (next: WeatherLocation) => {
    setLocation(next);
    notify(
      `Weather location changed to ${next.ward}, ${next.county}.`,
      "success",
    );
  };

  const handleAcknowledgeAlert = () => {
    if (!selectedAlert) return;
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === selectedAlert.id
          ? { ...alert, status: "Acknowledged" }
          : alert,
      ),
    );
    notify(`${selectedAlert.type} alert acknowledged.`, "info");
    closeModal();
  };

  const handleAlertPlan = () => {
    if (!selectedAlert) return;
    addTask(
      weatherTask(
        "Response",
        selectedAlert.action,
        selectedAlert.validUntil,
        selectedAlert.message,
      ),
    );
    notify(`Response task created for ${selectedAlert.type}.`, "success");
    closeModal();
  };

  const handleDeleteAlert = () => {
    if (!selectedAlert) return;
    setAlerts((current) =>
      current.filter((alert) => alert.id !== selectedAlert.id),
    );
    notify("Weather alert removed from this demo workspace.", "info");
    setSelectedAlert(null);
  };

  const handlePredictionSave = (draft: PredictionDraft) => {
    setPredictionDraft(draft);
    setSelectedPlanId(draft.cropPlanId);
    notify(
      `Weather prediction generated for ${draft.location}, ${draft.county}.`,
      "success",
    );
    setView("predictions");
  };

  const handleUseWindow = (window: PlantingWindow) => {
    notify(
      `${window.crop} window saved to your planning shortlist.`,
      "success",
    );
    closeModal();
    navigate({ to: "/app/planner" });
  };

  const handleWindowApply = (window: PlantingWindow) => {
    setSelectedWindow(window);
    setWindowShortlist((current) =>
      current.includes(window.id) ? current : [window.id, ...current],
    );
    notify(`${window.crop} planting recommendation saved.`, "success");
    setView("windows");
  };

  const handleWeatherAction = (message: string) => {
    addTask(
      weatherTask(
        message.toLowerCase().includes("spray") ? "Spray" : "Irrigation",
        message,
        "Next suitable window",
        "Generated from the forecast action card.",
      ),
    );
    notify(message, "success");
    closeModal();
  };

  const handleReportExport = (
    format: "csv" | "txt",
    options: { includeHistory: boolean; includeAlerts: boolean },
  ) => {
    if (format === "csv") {
      const rows = [
        ["Current temperature", "24", "°C"],
        ["Humidity", "78", "%"],
        ...forecast.map((day) => [
          day.day,
          `${day.min}–${day.max}`,
          `${day.rainChance}% rain`,
        ]),
        ...SEASONAL_OUTLOOK.map((month) => [
          month.month,
          month.rainfall,
          month.average,
        ]),
        ...(options.includeHistory
          ? HISTORICAL_WEATHER.map((month) => [
              month.month,
              `${month.rainfall} mm`,
              `${month.drySpellProbability}% dry-spell probability`,
            ])
          : []),
        ...(options.includeAlerts
          ? alerts.map((alert) => [alert.type, alert.county, alert.action])
          : []),
      ];
      downloadText(
        "growmo-weather-report.csv",
        [
          "Metric,Value,Note",
          ...rows.map((row) => row.map(csvCell).join(",")),
        ].join("\n"),
      );
    } else {
      const historyLine = options.includeHistory
        ? `\nHistorical baseline: ${HISTORICAL_WEATHER.map((month) => `${month.month} ${month.rainfall} mm`).join(" · ")}`
        : "\nHistorical baseline: excluded";
      const alertLine = options.includeAlerts
        ? `\nActive alerts: ${activeAlerts.length}`
        : "\nActive alerts: excluded";
      downloadText(
        "growmo-weather-report.txt",
        `GrowMO weather report\n${location.farm} · ${location.ward}, ${location.county}\nCurrent: 24°C, 78% humidity, 5.2 mm rain in 24 hours\nNext action: inspect cabbage for black rot after rain dries.${historyLine}${alertLine}`,
        "text/plain",
      );
    }
    notify(`Weather report downloaded as ${format.toUpperCase()}.`, "success");
  };

  const handleShare = (method: "copy" | "sms" | "download") => {
    const text = `GrowMO weather advisory: ${location.ward}, ${location.county}. Rain risk ${forecast[0]?.rainChance ?? 0}% today. Inspect cabbage after rain; next safe spray window is ${forecast[2]?.sprayWindow ?? "check station"}.`;
    if (method === "download")
      downloadText("growmo-weather-advisory.txt", text, "text/plain");
    if (method === "copy") void navigator.clipboard?.writeText(text);
    if (method === "sms")
      window.open(
        `sms:${WEATHER_CONTEXT.phone.replaceAll(" ", "")}?body=${encodeURIComponent(text)}`,
        "_blank",
      );
    notify(
      method === "sms"
        ? "SMS composer opened for the farm team."
        : method === "copy"
          ? "Advisory copied to clipboard."
          : "Advisory note downloaded.",
      "success",
    );
    closeModal();
  };

  const handleViewChange = (next: WeatherView) => {
    setView(next);
    setSearch("");
    setCountyFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const navItems = [
    { id: "today" as const, label: "Today", icon: <CloudSun />, count: 7 },
    { id: "forecast" as const, label: "7-day forecast", icon: <CloudRain /> },
    {
      id: "seasonal" as const,
      label: "Seasonal",
      icon: <CalendarDays />,
      count: 6,
    },
    {
      id: "predictions" as const,
      label: "Crop engine",
      icon: <Sprout />,
      count: CROP_WEATHER_PLANS.length,
    },
    {
      id: "windows" as const,
      label: "Planting windows",
      icon: <Leaf />,
      count: PLANTING_WINDOWS.length,
    },
    {
      id: "alerts" as const,
      label: "Alerts",
      icon: <BellRing />,
      count: activeAlerts.length,
    },
    {
      id: "history" as const,
      label: "History",
      icon: <History />,
      count: HISTORICAL_WEATHER.length,
    },
  ];

  const headerKpis = [
    { label: "Now", value: "24°C", note: "Feels like 22°C · light rain" },
    { label: "Rain next 24h", value: "70%", note: "8–15 mm expected" },
    { label: "Soil moisture", value: "65%", note: "+8% after recent rain" },
    {
      label: "Active alerts",
      value: `${activeAlerts.length}`,
      note: `${tasks.length} field tasks · ${plannedActions} plans saved`,
    },
  ];

  return (
    <main className="gm-app-page gm-weather-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-link-arrow">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="text-muted">/</span>
            <span className="text-muted">Grow</span>
            <span className="text-muted">/</span>
            <strong>Weather</strong>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setLocationDrawer(true)}
            >
              <MapPin /> {location.ward}
            </button>
            <div className="gm-dropdown">
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => setMenu((current) => !current)}
                aria-expanded={menu}
              >
                <MoreHorizontal /> Weather tools
              </button>
              {menu ? (
                <div className="gm-menu">
                  <button
                    type="button"
                    onClick={() => {
                      openModal("report");
                      setMenu(false);
                    }}
                  >
                    <Download /> Download weather report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("preferences");
                      setMenu(false);
                    }}
                  >
                    <Settings2 /> Alert settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("share");
                      setMenu(false);
                    }}
                  >
                    <BellRing /> Share advisory
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <WeatherHeaderCard
          location={location}
          kpis={headerKpis}
          actions={
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => openModal("location")}
              >
                <MapPin /> Change station
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-soft"
                onClick={() => openModal("report")}
              >
                <Download /> Export report
              </button>
            </div>
          }
        />
        <div className="gm-card p-2 mt-3">
          <PlannerSubtabs
            value={view}
            items={navItems}
            onChange={handleViewChange}
            label="Weather intelligence sections"
          />
        </div>

        <Reveal className="mt-4">
          {view === "today" ? (
            <TodayView
              location={location}
              forecast={forecast}
              onMetric={(metric) => {
                setSelectedMetric(metric);
                openModal("metric");
              }}
              onDay={(day) => {
                setSelectedDay(day);
                openModal("forecast-day");
              }}
              onSources={() => openModal("sources")}
              onRefresh={() => openModal("refresh")}
              onAlerts={() => handleViewChange("alerts")}
              onShare={() => openModal("share")}
            />
          ) : null}
          {view === "forecast" ? (
            <ForecastView
              forecast={forecast}
              onDay={(day) => {
                setSelectedDay(day);
                openModal("forecast-day");
              }}
              onRefresh={() => openModal("refresh")}
              onSpray={() => openModal("spray")}
            />
          ) : null}
          {view === "seasonal" ? (
            <SeasonalView
              risks={SEASONAL_RISKS}
              onOutlook={() => openModal("seasonal")}
              onRisk={(risk) => {
                setSelectedRisk(risk);
                openModal("seasonal-risk");
              }}
              onPrediction={() => handleViewChange("predictions")}
            />
          ) : null}
          {view === "predictions" ? (
            <PredictionsView
              plans={CROP_WEATHER_PLANS}
              selectedPlanId={selectedPlan.id}
              draft={predictionDraft}
              onSelect={setSelectedPlanId}
              onCreate={() => openModal("prediction-create")}
              onPeriod={(period) => {
                setSelectedPeriod(period);
                openModal("prediction-period");
              }}
              onIrrigation={() => openModal("irrigation")}
              onSpray={() => openModal("spray")}
            />
          ) : null}
          {view === "windows" ? (
            <WindowsView
              windows={PLANTING_WINDOWS}
              savedWindowIds={windowShortlist}
              search={search}
              countyFilter={countyFilter}
              page={page}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              onCounty={(value) => {
                setCountyFilter(value);
                setPage(1);
              }}
              onPage={setPage}
              onOpen={(window) => {
                setSelectedWindow(window);
                openModal("window");
              }}
              onAdvisor={() => openModal("window-advisor")}
            />
          ) : null}
          {view === "alerts" ? (
            <AlertsView
              alerts={alerts}
              customRules={customAlertRules}
              search={search}
              status={statusFilter}
              page={page}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              onStatus={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              onPage={setPage}
              onOpen={(alert) => {
                setSelectedAlert(alert);
                openModal("alert");
              }}
              onCreate={() => openModal("alert-create")}
              onDelete={(alert) => {
                setSelectedAlert(alert);
                openModal("delete-alert");
              }}
            />
          ) : null}
          {view === "history" ? (
            <HistoryView
              historical={HISTORICAL_WEATHER}
              search={search}
              page={page}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              onPage={setPage}
              onMonth={(month) => {
                setSelectedMonth(month);
                openModal("history-month");
              }}
              onCompare={() => openModal("history-compare")}
            />
          ) : null}
        </Reveal>
      </div>

      <DashboardDrawer
        open={locationDrawer}
        title="Weather station profile"
        onClose={() => setLocationDrawer(false)}
        footer={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => {
                setLocationDrawer(false);
                openModal("location");
              }}
            >
              Change station
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setLocationDrawer(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="d-grid gap-3">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon">
              <MapPin />
            </span>
            <div>
              <span className="gm-eyebrow">Active weather location</span>
              <h3 className="font-display mb-1">{location.farm}</h3>
              <p className="text-muted mb-0">
                {location.ward}, {location.county} · {location.elevation}
              </p>
            </div>
          </div>
          <div className="gm-plan-facts">
            <span>
              <Gauge />
              <small>Station</small>
              <strong>{location.station}</strong>
            </span>
            <span>
              <RefreshCw />
              <small>Last sync</small>
              <strong>{location.updated}</strong>
            </span>
            <span>
              <MapPin />
              <small>Distance</small>
              <strong>{location.distance}</strong>
            </span>
            <span>
              <ShieldCheck />
              <small>Confidence</small>
              <strong>86%</strong>
            </span>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-soft w-100"
            onClick={() => {
              setLocationDrawer(false);
              openModal("sources");
            }}
          >
            View source layers
          </button>
        </div>
      </DashboardDrawer>

      <LocationDialog
        open={modal === "location"}
        current={location}
        onClose={closeModal}
        onSelect={handleLocation}
      />
      <MetricDialog
        open={modal === "metric"}
        metric={selectedMetric}
        onClose={closeModal}
      />
      <ForecastDayDialog
        open={modal === "forecast-day"}
        day={selectedDay}
        onClose={closeModal}
        onPlan={handleWeatherAction}
      />
      <SourcesDialog
        open={modal === "sources"}
        sources={WEATHER_SOURCES}
        onClose={closeModal}
      />
      <RefreshStationDialog
        open={modal === "refresh"}
        location={location}
        onClose={closeModal}
        onComplete={() =>
          notify(
            "Weather station refreshed with the latest observation layer.",
            "success",
          )
        }
      />
      <SeasonalOutlookDialog
        open={modal === "seasonal"}
        months={SEASONAL_OUTLOOK}
        subscribed={seasonalSubscribed}
        onClose={closeModal}
        onSubscribe={() => {
          setSeasonalSubscribed(true);
          notify("Seasonal forecast alerts enabled for Kiambu.", "success");
        }}
      />
      <SeasonalRiskDialog
        open={modal === "seasonal-risk"}
        risk={selectedRisk}
        onClose={closeModal}
        onRemind={() => {
          if (selectedRisk)
            addTask(
              weatherTask(
                "Scout",
                `Scout for ${selectedRisk.risk}`,
                selectedRisk.timing,
                selectedRisk.advisory,
              ),
            );
          notify(
            "Scouting reminder added to your weather task list.",
            "success",
          );
          closeModal();
        }}
      />
      <PredictionWizard
        open={modal === "prediction-create"}
        onClose={closeModal}
        onSave={handlePredictionSave}
      />
      <PredictionPeriodDialog
        open={modal === "prediction-period"}
        period={selectedPeriod}
        onClose={closeModal}
        onTask={() => {
          if (selectedPeriod)
            addTask(
              weatherTask(
                "Scout",
                selectedPeriod.advisory,
                selectedPeriod.period,
                selectedPeriod.cropNeed,
              ),
            );
          notify("Field task created from the crop-stage advisory.", "success");
          closeModal();
        }}
      />
      <PlantingWindowDialog
        open={modal === "window"}
        window={selectedWindow}
        onClose={closeModal}
        onUse={() => selectedWindow && handleUseWindow(selectedWindow)}
      />
      <WindowAdvisorWizard
        open={modal === "window-advisor"}
        onClose={closeModal}
        onApply={handleWindowApply}
      />
      <AlertDialog
        open={modal === "alert"}
        alert={selectedAlert}
        onClose={closeModal}
        onAcknowledge={handleAcknowledgeAlert}
        onPlan={handleAlertPlan}
      />
      <CreateAlertWizard
        open={modal === "alert-create"}
        onClose={closeModal}
        onSave={(rule) => {
          setCustomAlertRules((current) => [rule, ...current]);
          notify(`${rule.type} alert saved for ${rule.county}.`, "success");
        }}
      />
      <HistoricalMonthDialog
        open={modal === "history-month"}
        month={selectedMonth}
        onClose={closeModal}
      />
      <HistoryCompareDialog
        open={modal === "history-compare"}
        months={HISTORICAL_WEATHER}
        onClose={closeModal}
      />
      <ReportExportDialog
        open={modal === "report"}
        onClose={closeModal}
        onExport={handleReportExport}
      />
      <PreferencesDialog
        open={modal === "preferences"}
        preferences={preferences}
        onClose={closeModal}
        onSave={(next) => {
          setPreferences(next);
          notify("Weather alert settings saved.", "success");
        }}
      />
      <IrrigationWizard
        open={modal === "irrigation"}
        onClose={closeModal}
        onSave={(plan) => {
          setIrrigationPlans((current) => [plan, ...current]);
          addTask(
            weatherTask(
              "Irrigation",
              `Irrigate ${plan.crop}`,
              plan.date,
              `${plan.minutes} minutes via ${plan.method}`,
            ),
          );
          notify("Irrigation plan saved to the weather task list.", "success");
        }}
      />
      <SprayWindowWizard
        open={modal === "spray"}
        onClose={closeModal}
        onSave={(plan) => {
          setSprayPlans((current) => [plan, ...current]);
          addTask(
            weatherTask("Spray", `Spray ${plan.crop}`, plan.date, plan.note),
          );
          notify("Spray window saved with its safety note.", "success");
        }}
      />
      <ShareAdvisoryDialog
        open={modal === "share"}
        title={`${location.ward} weather advisory`}
        onClose={closeModal}
        onShare={handleShare}
      />
      <ConfirmWeatherDialog
        open={modal === "delete-alert"}
        title="Remove this weather alert?"
        body={
          selectedAlert
            ? `${selectedAlert.type} for ${selectedAlert.county} will leave the active weather board. This does not change the source forecast.`
            : "This alert will leave the board."
        }
        onClose={closeModal}
        onConfirm={handleDeleteAlert}
      />
    </main>
  );
}
function TodayView({
  location,
  forecast,
  onMetric,
  onDay,
  onSources,
  onRefresh,
  onAlerts,
  onShare,
}: {
  location: WeatherLocation;
  forecast: WeatherForecastDay[];
  onMetric: (metric: CurrentWeatherMetric) => void;
  onDay: (day: WeatherForecastDay) => void;
  onSources: () => void;
  onRefresh: () => void;
  onAlerts: () => void;
  onShare: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.1 · Current conditions"
        title="The field has a forecast; your crop needs a decision"
        subtitle={`Live conditions for ${location.ward}, ${location.county}. GrowMO translates rain, wind, humidity and soil moisture into a practical field plan.`}
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={onShare}
            >
              <BellRing /> Share advisory
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onAlerts}
            >
              <AlertTriangle /> Review alerts
            </button>
          </div>
        }
      />
      <div className="row g-3 mt-2">
        <div className="col-xl-8">
          <CurrentConditionsCard
            metrics={CURRENT_WEATHER_METRICS}
            onMetric={onMetric}
          />
        </div>
        <div className="col-xl-4">
          <WeatherRadarCard
            location={location}
            onSources={onSources}
            onRefresh={onRefresh}
          />
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
          <div>
            <span className="gm-eyebrow">Next seven days</span>
            <h3 className="font-display mb-1">When can the farm team act?</h3>
            <p className="text-muted mb-0">
              Tap a day for rain, spray and irrigation detail.
            </p>
          </div>
          <StatusChip label="Kiambu · live planning" tone="low" />
        </div>
        <div className="row g-3">
          {forecast.map((day) => (
            <div className="col-12 col-sm-6 col-xl-3" key={day.id}>
              <ForecastDayCard day={day} onOpen={() => onDay(day)} />
            </div>
          ))}
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-4">
          <button
            type="button"
            className="gm-option-row h-100"
            onClick={onAlerts}
          >
            <span className="gm-mega-icon">
              <AlertTriangle />
            </span>
            <span>
              <strong>Check drainage before the next shower</strong>
              <small>
                Heavy rain and flood warnings are active in the region.
              </small>
            </span>
            <ArrowRight />
          </button>
        </div>
        <div className="col-lg-4">
          <button
            type="button"
            className="gm-option-row h-100"
            onClick={() => onDay(forecast[2] ?? forecast[0])}
          >
            <span className="gm-mega-icon">
              <Sprout />
            </span>
            <span>
              <strong>Save the next spray window</strong>
              <small>Day 3 has a dry 09:00–11:30 window.</small>
            </span>
            <ArrowRight />
          </button>
        </div>
        <div className="col-lg-4">
          <button
            type="button"
            className="gm-option-row h-100"
            onClick={onShare}
          >
            <span className="gm-mega-icon">
              <MapPin />
            </span>
            <span>
              <strong>Send the advisory to the team</strong>
              <small>
                Share a short Kiswahili field instruction by SMS or copy.
              </small>
            </span>
            <ArrowRight />
          </button>
        </div>
      </div>
    </>
  );
}

function ForecastView({
  forecast,
  onDay,
  onRefresh,
  onSpray,
}: {
  forecast: WeatherForecastDay[];
  onDay: (day: WeatherForecastDay) => void;
  onRefresh: () => void;
  onSpray: () => void;
}) {
  const [miniTab, setMiniTab] = useState<"table" | "actions">("table");
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.2 · 7-day detailed forecast"
        title="Choose the right six hours"
        subtitle="Rain probability is useful; sprayability, soil moisture and crop impact make it actionable."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onRefresh}
            >
              <RefreshCw /> Refresh forecast
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onSpray}
            >
              <Sprout /> Save spray window
            </button>
          </div>
        }
      />
      <div className="row g-3 mt-2">
        <div className="col-xl-8">
          <div className="gm-card p-3 h-100">
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
              <div>
                <span className="gm-eyebrow">Temperature curve</span>
                <h3 className="font-display mb-1">Daily maximums</h3>
                <p className="text-muted mb-0">
                  Rain bars and crop action remain in the table below.
                </p>
              </div>
              <StatusChip label="7-day outlook" tone="low" />
            </div>
            <TrendChart
              points={forecast.map((day) => ({
                label: day.day.replace("Tomorrow", "Tom").replace("Day ", "D"),
                value: day.max,
              }))}
              formatValue={(value) => `${value}°`}
            />
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Spray discipline</span>
            <h3 className="font-display mb-2">Rain is not a spray window</h3>
            <p className="text-muted">
              Wait for dry leaves, low wind and at least six hours without rain.
              Keep Mancozeb's 14-day PHI visible in the task.
            </p>
            <div className="gm-check-row">
              <Wind />
              <span>
                <strong>Best upcoming window</strong>
                <small>Day 3 · 09:00–11:30 · wind 10 km/h</small>
              </span>
              <StatusChip label="Good" tone="low" />
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-outline w-100 mt-3"
              onClick={onSpray}
            >
              Open spray wizard
            </button>
          </div>
        </div>
      </div>
      <div className="gm-card p-2 mt-3">
        <div
          className="gm-tabs gm-tabs-mini"
          role="tablist"
          aria-label="Forecast detail tabs"
        >
          <button
            type="button"
            className={`gm-tab ${miniTab === "table" ? "on" : ""}`}
            onClick={() => setMiniTab("table")}
          >
            Detailed table
          </button>
          <button
            type="button"
            className={`gm-tab ${miniTab === "actions" ? "on" : ""}`}
            onClick={() => setMiniTab("actions")}
          >
            Farm actions
          </button>
        </div>
      </div>
      {miniTab === "table" ? (
        <div className="gm-card p-3 mt-2">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Condition</th>
                  <th>Min / max</th>
                  <th>Rain chance</th>
                  <th>Rain amount</th>
                  <th>Wind</th>
                  <th>Humidity</th>
                  <th>Crop impact</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {forecast.map((day) => (
                  <tr key={day.id}>
                    <td>
                      <button
                        type="button"
                        className="gm-table-link text-start"
                        onClick={() => onDay(day)}
                      >
                        <strong>{day.day}</strong>
                        <small className="d-block text-muted">{day.date}</small>
                      </button>
                    </td>
                    <td>{day.condition}</td>
                    <td>
                      <strong className="font-display">{day.max}°</strong> /{" "}
                      {day.min}°C
                    </td>
                    <td>
                      <StatusChip
                        label={`${day.rainChance}%`}
                        tone={
                          day.rainChance >= 70
                            ? "high"
                            : day.rainChance >= 40
                              ? "medium"
                              : "low"
                        }
                      />
                    </td>
                    <td>{day.rainAmount}</td>
                    <td>{day.wind}</td>
                    <td>{day.humidity}%</td>
                    <td>
                      <small>{day.cropImpact}</small>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View ${day.day} forecast`}
                        onClick={() => onDay(day)}
                      >
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row g-3 mt-2">
          {forecast.slice(0, 6).map((day) => (
            <div className="col-md-6 col-xl-4" key={day.id}>
              <div className="gm-card p-3 h-100">
                <span className="gm-eyebrow">
                  {day.day} · {day.date}
                </span>
                <h3 className="font-display mb-1">
                  {day.rainChance >= 70
                    ? "Protect field work"
                    : day.rainChance <= 20
                      ? "Dry field window"
                      : "Check before acting"}
                </h3>
                <p className="text-muted mb-2">{day.cropImpact}</p>
                <div className="gm-check-row">
                  <CloudRain />
                  <span>
                    <strong>{day.rainAmount}</strong>
                    <small>{day.irrigation}</small>
                  </span>
                </div>
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm mt-2"
                  onClick={() => onDay(day)}
                >
                  Open action detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function SeasonalView({
  risks,
  onOutlook,
  onRisk,
  onPrediction,
}: {
  risks: SeasonalRisk[];
  onOutlook: () => void;
  onRisk: (risk: SeasonalRisk) => void;
  onPrediction: () => void;
}) {
  const [miniTab, setMiniTab] = useState<"outlook" | "risks">("outlook");
  const [query, setQuery] = useState("");
  const [riskPage, setRiskPage] = useState(1);
  const filtered = risks.filter((risk) =>
    `${risk.risk} ${risk.crop} ${risk.advisory}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const perPage = 4;
  const total = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((riskPage - 1) * perPage, riskPage * perPage);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.3 · Seasonal forecast"
        title="Look beyond the next shower"
        subtitle="Short Rains 2026 for Kiambu combines Kenya Met's outlook with crop-specific risk interpretation."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onOutlook}
            >
              <CloudSun /> Full 3-month outlook
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onPrediction}
            >
              <Sprout /> Crop prediction engine
            </button>
          </div>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
          <div>
            <span className="gm-eyebrow">October–December 2026 · Kiambu</span>
            <h3 className="font-display mb-1">Seasonal pulse</h3>
            <p className="text-muted mb-0">
              November is wetter than normal; December rain tapers mid-month.
            </p>
          </div>
          <StatusChip label="Kenya Met + GrowMO AI" tone="low" />
        </div>
        <div className="row g-3">
          {SEASONAL_OUTLOOK.map((month) => (
            <div className="col-md-4" key={month.id}>
              <div className="gm-card p-3 h-100">
                <span className="gm-eyebrow">{month.month}</span>
                <strong
                  className="font-display d-block mt-1"
                  style={{ fontSize: "1.45rem" }}
                >
                  {month.rainfall}
                </strong>
                <small className="text-muted">
                  {month.average} · {month.temperature}
                </small>
                <div className="gm-plan-facts mt-3">
                  <span>
                    <CloudRain />
                    <small>Rainy days</small>
                    <strong>{month.rainyDays}</strong>
                  </span>
                  <span>
                    <AlertTriangle />
                    <small>Flood risk</small>
                    <strong>{month.floodRisk}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="gm-card p-2 mt-3">
        <div
          className="gm-tabs gm-tabs-mini"
          role="tablist"
          aria-label="Seasonal weather tabs"
        >
          <button
            type="button"
            className={`gm-tab ${miniTab === "outlook" ? "on" : ""}`}
            onClick={() => setMiniTab("outlook")}
          >
            Monthly outlook
          </button>
          <button
            type="button"
            className={`gm-tab ${miniTab === "risks" ? "on" : ""}`}
            onClick={() => setMiniTab("risks")}
          >
            Crop risks <span className="gm-n">{risks.length}</span>
          </button>
        </div>
      </div>
      {miniTab === "outlook" ? (
        <div className="gm-card p-3 mt-2">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <th key={month.id}>{month.month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rainfall</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>{month.rainfall}</td>
                  ))}
                </tr>
                <tr>
                  <td>Temperature</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>{month.temperature}</td>
                  ))}
                </tr>
                <tr>
                  <td>Onset</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>{month.onset}</td>
                  ))}
                </tr>
                <tr>
                  <td>Cessation</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>{month.cessation}</td>
                  ))}
                </tr>
                <tr>
                  <td>Dry spell risk</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>
                      <StatusChip
                        label={month.drySpellRisk}
                        tone={
                          month.drySpellRisk === "Moderate" ? "medium" : "low"
                        }
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Flood risk</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>
                      <StatusChip
                        label={month.floodRisk}
                        tone={month.floodRisk === "Moderate" ? "medium" : "low"}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Rainy days</td>
                  {SEASONAL_OUTLOOK.map((month) => (
                    <td key={month.id}>{month.rainyDays}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="gm-check-row mt-3">
            <CloudSun />
            <div>
              <strong>GrowMO seasonal advisory</strong>
              <p>
                Planting Oct 20 was a good establishment choice. Plan drainage
                now, then reserve irrigation for cabbage heading in the second
                half of December.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="gm-card p-3 mt-2">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
            <div>
              <span className="gm-eyebrow">AI crop-risk interpretation</span>
              <h3 className="font-display mb-1">
                Which risk needs a field walk?
              </h3>
            </div>
            <div className="gm-search-field">
              <input
                className="gm-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setRiskPage(1);
                }}
                placeholder="Search crop risk"
              />
            </div>
          </div>
          <div className="d-grid gap-3 mt-3">
            {rows.map((risk) => (
              <SeasonalRiskCard
                key={risk.id}
                risk={risk}
                onOpen={() => onRisk(risk)}
              />
            ))}
          </div>
          <Pagination
            page={Math.min(riskPage, total)}
            total={total}
            onChange={setRiskPage}
            perPage={perPage}
            totalItems={filtered.length}
          />
        </div>
      )}
    </>
  );
}

function PredictionsView({
  plans,
  selectedPlanId,
  draft,
  onSelect,
  onCreate,
  onPeriod,
  onIrrigation,
  onSpray,
}: {
  plans: typeof CROP_WEATHER_PLANS;
  selectedPlanId: string;
  draft: PredictionDraft | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onPeriod: (period: CropPredictionPeriod) => void;
  onIrrigation: () => void;
  onSpray: () => void;
}) {
  const plan = plans.find((item) => item.id === selectedPlanId) ?? plans[0];
  const activeDraft = draft?.cropPlanId === plan.id ? draft : null;
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.4 · Crop-specific prediction engine"
        title="A forecast for the whole crop, not just today"
        subtitle="When you plant, GrowMO maps likely rain, temperature and crop needs across every growth stage."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onCreate}
          >
            <Plus /> Generate prediction
          </button>
        }
      />
      <div className="gm-card p-2 mt-3">
        <div className="gm-tabs" role="tablist" aria-label="Crop weather plans">
          {plans.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === selectedPlanId}
              className={`gm-tab ${item.id === selectedPlanId ? "on" : ""}`}
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              {item.crop} <span className="gm-n">{item.county}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-8">
          <PredictionTimeline plan={plan} onPeriod={onPeriod} />
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Prediction profile</span>
            <h3 className="font-display mb-2">
              {plan.crop} {plan.variety}
            </h3>
            <p className="text-muted">
              {activeDraft?.location ?? plan.location},{" "}
              {activeDraft?.county ?? plan.county} · planted{" "}
              {activeDraft?.plantingDate ?? plan.plantingDate} · {plan.duration}
            </p>
            {activeDraft?.notes ? (
              <div className="gm-check-row">
                <ShieldCheck />
                <span>
                  <strong>Farmer note saved</strong>
                  <small>{activeDraft.notes}</small>
                </span>
              </div>
            ) : null}
            <div className="gm-check-row">
              <CloudRain />
              <span>
                <strong>Weather match today</strong>
                <small>
                  {plan.periods[2]?.match} · {plan.periods[2]?.advisory}
                </small>
              </span>
              <StatusChip
                label={plan.periods[2]?.match ?? "Good"}
                tone={plan.periods[2]?.match === "Low" ? "medium" : "low"}
              />
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={onIrrigation}
              >
                Plan irrigation
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={onSpray}
              >
                Save spray window
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <Link to="/app/crops" className="gm-option-row h-100">
            <span className="gm-mega-icon">
              <Sprout />
            </span>
            <span>
              <strong>Open crop growth tracker</strong>
              <small>Compare weather stage with actual crop progress.</small>
            </span>
            <ArrowRight />
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/app/inventory" className="gm-option-row h-100">
            <span className="gm-mega-icon">
              <Leaf />
            </span>
            <span>
              <strong>Check spray inventory</strong>
              <small>Confirm Mancozeb and foliar feed before the window.</small>
            </span>
            <ArrowRight />
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/app/planner" className="gm-option-row h-100">
            <span className="gm-mega-icon">
              <CalendarDays />
            </span>
            <span>
              <strong>Open season planner</strong>
              <small>Turn the prediction into a full field calendar.</small>
            </span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </>
  );
}

function WindowsView({
  windows,
  savedWindowIds,
  search,
  countyFilter,
  page,
  onSearch,
  onCounty,
  onPage,
  onOpen,
  onAdvisor,
}: {
  windows: PlantingWindow[];
  savedWindowIds: string[];
  search: string;
  countyFilter: string;
  page: number;
  onSearch: (value: string) => void;
  onCounty: (value: string) => void;
  onPage: (page: number) => void;
  onOpen: (window: PlantingWindow) => void;
  onAdvisor: () => void;
}) {
  const filtered = windows.filter(
    (window) =>
      `${window.county} ${window.crop} ${window.bestWindow} ${window.reason}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (countyFilter === "all" || window.county === countyFilter),
  );
  const perPage = 6;
  const total = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const counties = [...new Set(windows.map((window) => window.county))];
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.5 · Planting window advisor"
        title="Choose the season before you choose the seed"
        subtitle="County-aware planting windows protect establishment, flowering and harvest from avoidable weather risk."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onAdvisor}
          >
            <Sprout /> Find my window
          </button>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-field" style={{ flex: "1 1 280px" }}>
            <Search />
            <input
              className="gm-input"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search county, crop or reason"
            />
          </div>
          <select
            className="gm-select"
            value={countyFilter}
            onChange={(event) => onCounty(event.target.value)}
          >
            <option value="all">All counties</option>
            {counties.map((county) => (
              <option value={county} key={county}>
                {county}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => {
              onSearch("");
              onCounty("all");
            }}
          >
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>County / crop</th>
                <th>Best window</th>
                <th>Good window</th>
                <th>Risky / avoid</th>
                <th>Water need</th>
                <th>Why</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((window) => (
                <tr key={window.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link text-start"
                      onClick={() => onOpen(window)}
                    >
                      <strong>{window.crop}</strong>
                      <small className="d-block text-muted">
                        {window.county}
                      </small>
                      {savedWindowIds.includes(window.id) ? (
                        <StatusChip label="Saved" tone="low" />
                      ) : null}
                    </button>
                  </td>
                  <td>
                    <strong>{window.bestWindow}</strong>
                  </td>
                  <td>{window.goodWindow}</td>
                  <td>
                    <small>{window.riskyWindow}</small>
                    <small className="d-block text-danger">
                      Avoid: {window.avoid}
                    </small>
                  </td>
                  <td>
                    <StatusChip
                      label={window.waterNeed}
                      tone={
                        window.waterNeed === "High"
                          ? "medium"
                          : window.waterNeed === "Low"
                            ? "low"
                            : "neutral"
                      }
                    />
                  </td>
                  <td>
                    <small>{window.reason}</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${window.crop} planting window`}
                      onClick={() => onOpen(window)}
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
            No planting window matches this search.
          </p>
        ) : null}
        <Pagination
          page={Math.min(page, total)}
          total={total}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <div className="gm-check-row">
        <Sprout />
        <div>
          <strong>Planting is a risk decision</strong>
          <p>
            Kiambu cabbage planted from 01 Oct to 15 Nov has the best
            establishment odds. If you plant outside the window, irrigation and
            scouting become part of the budget.
          </p>
        </div>
      </div>
    </>
  );
}

function AlertsView({
  alerts,
  customRules,
  search,
  status,
  page,
  onSearch,
  onStatus,
  onPage,
  onOpen,
  onCreate,
  onDelete,
}: {
  alerts: ExtremeWeatherAlert[];
  customRules: AlertRuleDraft[];
  search: string;
  status: WeatherAlertStatus | "all";
  page: number;
  onSearch: (value: string) => void;
  onStatus: (value: WeatherAlertStatus | "all") => void;
  onPage: (page: number) => void;
  onOpen: (alert: ExtremeWeatherAlert) => void;
  onCreate: () => void;
  onDelete: (alert: ExtremeWeatherAlert) => void;
}) {
  const filtered = alerts.filter(
    (alert) =>
      `${alert.type} ${alert.county} ${alert.message} ${alert.action}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "all" || alert.status === status),
  );
  const perPage = 5;
  const total = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.6 · Extreme weather alerts"
        title="Warnings are only useful when the action is clear"
        subtitle="Acknowledge, create a response task, share the advisory or dismiss a stale demo alert from the board."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onCreate}
            >
              <Plus /> Create alert
            </button>
            <Link to="/app/labour" className="gm-btn gm-btn-lime">
              <ArrowRight /> Open field tasks
            </Link>
          </div>
        }
      />
      <div className="row g-3 mt-2">
        {alerts
          .filter((alert) => alert.status === "Active")
          .slice(0, 3)
          .map((alert) => (
            <div className="col-xl-4" key={alert.id}>
              <AlertCard alert={alert} onOpen={() => onOpen(alert)} />
            </div>
          ))}
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gm-search-field" style={{ flex: "1 1 280px" }}>
            <Search />
            <input
              className="gm-input"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search alert, county or action"
            />
          </div>
          <select
            className="gm-select"
            value={status}
            onChange={(event) =>
              onStatus(event.target.value as WeatherAlertStatus | "all")
            }
          >
            <option value="all">All alert states</option>
            <option>Active</option>
            <option>Acknowledged</option>
          </select>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => {
              onSearch("");
              onStatus("all");
            }}
          >
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Alert</th>
                <th>County</th>
                <th>Severity</th>
                <th>Message</th>
                <th>Action</th>
                <th>Valid until</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link text-start"
                      onClick={() => onOpen(alert)}
                    >
                      <strong>{alert.type}</strong>
                      <small className="d-block text-muted">{alert.id}</small>
                    </button>
                  </td>
                  <td>{alert.county}</td>
                  <td>
                    <StatusChip
                      label={alert.severity}
                      tone={alertTone(alert.severity)}
                    />
                  </td>
                  <td>
                    <small>{alert.message}</small>
                  </td>
                  <td>
                    <strong>{alert.action}</strong>
                  </td>
                  <td>{alert.validUntil}</td>
                  <td>
                    <StatusChip
                      label={alert.status}
                      tone={alert.status === "Active" ? "high" : "low"}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Open ${alert.type}`}
                        onClick={() => onOpen(alert)}
                      >
                        <Eye />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Remove ${alert.type}`}
                        onClick={() => onDelete(alert)}
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
        {rows.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No alert matches.</p>
        ) : null}
        <Pagination
          page={Math.min(page, total)}
          total={total}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Saved rules</span>
            <h3 className="font-display mb-1">Your alert triggers</h3>
            <p className="text-muted">
              Custom warnings stay separate from official source alerts.
            </p>
            {customRules.length === 0 ? (
              <div className="gm-check-row">
                <BellRing />
                <span>
                  <strong>No custom rules yet</strong>
                  <small>
                    Create a rule for rain, frost, wind or dry spell.
                  </small>
                </span>
              </div>
            ) : (
              customRules.map((rule) => (
                <div
                  className="gm-check-row"
                  key={`${rule.type}-${rule.county}-${rule.threshold}`}
                >
                  <BellRing />
                  <span>
                    <strong>
                      {rule.type} · {rule.county}
                    </strong>
                    <small>
                      {rule.threshold} · {rule.channel}
                    </small>
                  </span>
                  <StatusChip label="Saved" tone="low" />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Safety protocol</span>
            <h3 className="font-display mb-1">When a high alert lands</h3>
            <div className="gm-timeline">
              <div className="gm-tl-item is-current">
                <span className="gm-tl-dot">
                  <span>1</span>
                </span>
                <div>
                  <strong>Read the action</strong>
                  <small className="d-block text-muted">
                    Move livestock, pause spray or secure structures.
                  </small>
                </div>
              </div>
              <div className="gm-tl-item">
                <span className="gm-tl-dot">
                  <span>2</span>
                </span>
                <div>
                  <strong>Create a response task</strong>
                  <small className="d-block text-muted">
                    Assign the action to your field team.
                  </small>
                </div>
              </div>
              <div className="gm-tl-item">
                <span className="gm-tl-dot">
                  <span>3</span>
                </span>
                <div>
                  <strong>Acknowledge after checking</strong>
                  <small className="d-block text-muted">
                    Keep the board honest for the next warning.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function HistoryView({
  historical,
  search,
  page,
  onSearch,
  onPage,
  onMonth,
  onCompare,
}: {
  historical: HistoricalWeatherMonth[];
  search: string;
  page: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onMonth: (month: HistoricalWeatherMonth) => void;
  onCompare: () => void;
}) {
  const filtered = historical.filter((month) =>
    `${month.month} ${month.note}`.toLowerCase().includes(search.toLowerCase()),
  );
  const perPage = 6;
  const total = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="8.7 · Historical weather data"
        title="Use the past to plan the next season"
        subtitle="Twelve months of rainfall, temperature and dry-spell probability for better crop timing in Kiambu."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onCompare}
            >
              <History /> Compare months
            </button>
            <Link to="/app/planner" className="gm-btn gm-btn-lime">
              <ArrowRight /> Use in planner
            </Link>
          </div>
        }
      />
      <HistoricalWeatherChart historical={historical} onMonth={onMonth} />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div>
            <span className="gm-eyebrow">Historical index</span>
            <h3 className="font-display mb-1">Search the planning record</h3>
          </div>
          <div className="gm-search-field" style={{ flex: "1 1 260px" }}>
            <Search />
            <input
              className="gm-input"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search month or note"
            />
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onSearch("")}
          >
            <RefreshCw /> Reset
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Rainfall</th>
                <th>Min</th>
                <th>Max</th>
                <th>Rainy days</th>
                <th>Dry spell probability</th>
                <th>Planning note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((month) => (
                <tr key={month.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onMonth(month)}
                    >
                      <strong>{month.month}</strong>
                    </button>
                  </td>
                  <td>{month.rainfall} mm</td>
                  <td>{month.minTemp}°C</td>
                  <td>{month.maxTemp}°C</td>
                  <td>{month.rainyDays}</td>
                  <td>
                    <StatusChip
                      label={`${month.drySpellProbability}%`}
                      tone={
                        month.drySpellProbability > 55
                          ? "high"
                          : month.drySpellProbability > 30
                            ? "medium"
                            : "low"
                      }
                    />
                  </td>
                  <td>
                    <small>{month.note}</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Open ${month.month}`}
                      onClick={() => onMonth(month)}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={Math.min(page, total)}
          total={total}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
    </>
  );
}
