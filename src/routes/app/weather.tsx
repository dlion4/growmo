/* ============================================================================
   PAGE 8 — WEATHER & CLIMATE INTELLIGENCE  ·  /app/weather
   Blueprint sections 8.1 – 8.7:
     8.1 Current conditions (live, 14 parameters)
     8.2 7-day detailed forecast (+ hourly strip, spray windows)
     8.3 Seasonal 3-month outlook + AI crop advisory + scenarios
     8.4 Crop-specific weather prediction engine (stage by stage)
     8.5 Planting window advisor (county × crop, filterable + paginated)
     8.6 Extreme weather alerts (rules, broadcast, mitigation tasks)
     8.7 Historical weather data (monthly, 10-year, gauge log, stations)
   Styling: master theme + weather.css (§19). Data: data/app/weather.ts.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  ClipboardList,
  CloudRain,
  CloudSun,
  Coins,
  Download,
  Droplets,
  Eye,
  FileDown,
  Filter,
  FlaskConical,
  Gauge,
  History,
  Info,
  Layers,
  LineChart,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Navigation,
  Plus,
  Radio,
  RefreshCw,
  Satellite,
  Send,
  Settings2,
  Share2,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Sprout,
  Sun,
  TriangleAlert,
  Wind,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
  WizardActions,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  CONDITION_ICONS,
  severityTone,
  WxAlertCard,
  WxBalanceBar,
  WxConditionDetail,
  WxConditionTile,
  WxContactRow,
  WxDayCard,
  WxDekadalGrid,
  WxFactGrid,
  WxField,
  WxHourlyStrip,
  WxModalFooter,
  WxMonthCard,
  WxNote,
  WxObservationRow,
  WxRainChart,
  WxStageRail,
  WxSummary,
  WxWindowLegend,
  WxWindowTrack,
} from "../../components/app/WeatherWidgets";
import {
  Dialog,
  PinPad,
  ScoreRing,
  Stepper,
  Toggle,
} from "../../components/auth/controls";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  ALERT_ARCHIVE,
  ALERT_CONTACTS,
  ALERT_RULES,
  type AlertRule,
  CROP_WEATHER_PLANS,
  type CropPeriod,
  type CropWeatherPlan,
  CURRENT_CONDITIONS,
  DATA_SOURCES,
  ENGINE_CROP_LIBRARY,
  EXTREME_ALERTS,
  type ExtremeAlert,
  type ForecastDay,
  GAUGE_OBSERVATIONS,
  type GaugeObservation,
  HISTORICAL_MONTHLY,
  HISTORICAL_YEARS,
  type HistoryMonth,
  HOURLY_TODAY,
  IRRIGATION_PLOTS,
  LONG_TERM_AVG,
  PLAN_INPUTS,
  PLANTING_WINDOWS,
  type PlantingWindow,
  SEASONAL_ADVISORY,
  SEASONAL_OUTLOOK,
  SEVEN_DAY_FORECAST,
  SMS_BUNDLE,
  SPRAY_PRODUCTS,
  STATION_FAULTS,
  type StationFault,
  WEATHER_FAQS,
  WEATHER_PROFILE,
  WEATHER_SCENARIOS,
  WEATHER_STATIONS,
  type WeatherStation,
} from "../../data/app/weather";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/weather")({
  component: WeatherPage,
});

/* ============================ local types ============================ */

type WeatherView =
  | "now"
  | "outlook"
  | "engine"
  | "planting"
  | "alerts"
  | "history";
type DrawerId = "stations" | "alerts" | "observations" | "window" | null;
type ModalId =
  | "station"
  | "sources"
  | "day"
  | "spray"
  | "irrigation"
  | "drainage"
  | "shelter"
  | "cover"
  | "scout"
  | "harvest-plan"
  | "sms"
  | "rules"
  | "premium"
  | "confirm-ack"
  | "confirm-dismiss"
  | "confirm-rule"
  | "month"
  | "scenario"
  | "period"
  | "engine-add"
  | "engine-sync"
  | "planting-plan"
  | "export"
  | "compare"
  | "observation"
  | "observation-detail"
  | "confirm-observation"
  | "fault"
  | "station-log"
  | "share"
  | "et0"
  | null;

interface WeatherTask {
  id: string;
  title: string;
  detail: string;
  due: string;
  plot: string;
  cost: number;
  source: string;
  status: "Open" | "Scheduled" | "Done";
}

interface SentMessage {
  id: string;
  channel: string;
  recipients: string;
  body: string;
  cost: number;
  at: string;
  ref: string;
}

/* ============================ helpers ============================ */

function downloadText(filename: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvLine(cells: (string | number)[]) {
  return cells
    .map((cell) => {
      const text = String(cell);
      return text.includes(",") || text.includes('"')
        ? `"${text.replaceAll('"', '""')}"`
        : text;
    })
    .join(",");
}

/** Deterministic 3-hour model blocks for a forecast day (demo output). */
function dayBlocks(day: ForecastDay) {
  const blocks = [
    { label: "06:00 – 09:00", at: 0.15 },
    { label: "09:00 – 12:00", at: 0.5 },
    { label: "12:00 – 15:00", at: 0.85 },
    { label: "15:00 – 18:00", at: 0.6 },
  ];
  return blocks.map((block, index) => {
    const temp = Math.round(day.min + (day.max - day.min) * block.at);
    const rainPct = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          day.rainPct * (index === 3 ? 1.25 : index === 2 ? 0.8 : 0.6),
        ),
      ),
    );
    const wind = Math.max(3, Math.round(day.wind * (index === 3 ? 1.2 : 0.9)));
    return {
      label: block.label,
      temp,
      rainPct,
      wind,
      humidity: Math.max(
        45,
        Math.min(95, Math.round(day.humidity - index * 4)),
      ),
      spray:
        wind > 15 || rainPct > 55
          ? "No"
          : rainPct > 35
            ? "Short window"
            : "Yes",
    };
  });
}

function taskStatusTone(status: WeatherTask["status"]) {
  return status === "Done" ? "low" : status === "Scheduled" ? "medium" : "high";
}

const VIEW_ITEMS: {
  id: WeatherView;
  label: string;
  icon: React.ReactNode;
  count?: number;
}[] = [
  { id: "now", label: "Live now", icon: <CloudSun width={15} height={15} /> },
  {
    id: "outlook",
    label: "Seasonal outlook",
    icon: <CalendarDays width={15} height={15} />,
  },
  {
    id: "engine",
    label: "Crop prediction engine",
    icon: <Sprout width={15} height={15} />,
  },
  {
    id: "planting",
    label: "Planting windows",
    icon: <Layers width={15} height={15} />,
  },
  {
    id: "alerts",
    label: "Extreme alerts",
    icon: <ShieldAlert width={15} height={15} />,
    count: EXTREME_ALERTS.length,
  },
  {
    id: "history",
    label: "History & stations",
    icon: <History width={15} height={15} />,
  },
];

/* ============================ page ============================ */

function WeatherPage() {
  const toast = useToast();
  const [view, setView] = useState<WeatherView>("now");
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedLabel, setUpdatedLabel] = useState(WEATHER_PROFILE.updated);
  const [wallet, setWallet] = useState(35000);
  const [premium, setPremium] = useState(false);

  const [stationId, setStationId] = useState("st-01");
  const [datumId, setDatumId] = useState("cc-humidity");
  const [hour, setHour] = useState("15:00");
  const [dayId, setDayId] = useState("fd-2");
  const [monthId, setMonthId] = useState("sm-nov");
  const [scenarioId, setScenarioId] = useState("sc-base");
  const [periodId, setPeriodId] = useState("cb-5");
  const [planId, setPlanId] = useState("cw-cabbage");
  const [windowId, setWindowId] = useState("pw-01");
  const [alertId, setAlertId] = useState("al-02");
  const [observationId, setObservationId] = useState("go-01");
  const [historyId, setHistoryId] = useState("hm-04");
  const [yearId, setYearId] = useState("hy-2023");
  const [faultId, setFaultId] = useState("sf-01");

  const [plans, setPlans] = useState<CropWeatherPlan[]>(CROP_WEATHER_PLANS);
  const [alerts, setAlerts] = useState<ExtremeAlert[]>(EXTREME_ALERTS);
  const [observations, setObservations] =
    useState<GaugeObservation[]>(GAUGE_OBSERVATIONS);
  const [rules, setRules] = useState<AlertRule[]>(ALERT_RULES);
  const [faults, setFaults] = useState<StationFault[]>(STATION_FAULTS);
  const [tasks, setTasks] = useState<WeatherTask[]>([]);
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [syncedPeriodIds, setSyncedPeriodIds] = useState<string[]>([]);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [scenarioRun, setScenarioRun] = useState(0);

  /* filters + pagination */
  const [windowQuery, setWindowQuery] = useState("");
  const [windowGroup, setWindowGroup] = useState("All");
  const [windowCounty, setWindowCounty] = useState("All");
  const [windowPage, setWindowPage] = useState(1);
  const [alertFilter, setAlertFilter] = useState<
    "all" | "open" | ExtremeAlert["severity"]
  >("all");
  const [alertQuery, setAlertQuery] = useState("");
  const [alertPage, setAlertPage] = useState(1);
  const [stationQuery, setStationQuery] = useState("");
  const [stationStatus, setStationStatus] = useState("All");
  const [stationPage, setStationPage] = useState(1);
  const [yearRange, setYearRange] = useState<"5" | "10">("10");
  const [obsPage, setObsPage] = useState(1);
  const [yearPage, setYearPage] = useState(1);

  useEffect(() => {
    if (modal || drawer) {
      window.dispatchEvent(new Event("close-appshell-drawers"));
    }
  }, [modal, drawer]);

  const station =
    WEATHER_STATIONS.find((row) => row.id === stationId) ?? WEATHER_STATIONS[0];
  const datum =
    CURRENT_CONDITIONS.find((row) => row.id === datumId) ??
    CURRENT_CONDITIONS[0];
  const hourSlot =
    HOURLY_TODAY.find((row) => row.hour === hour) ?? HOURLY_TODAY[0];
  const day =
    SEVEN_DAY_FORECAST.find((row) => row.id === dayId) ?? SEVEN_DAY_FORECAST[0];
  const month =
    SEASONAL_OUTLOOK.find((row) => row.id === monthId) ?? SEASONAL_OUTLOOK[0];
  const scenario =
    WEATHER_SCENARIOS.find((row) => row.id === scenarioId) ??
    WEATHER_SCENARIOS[0];
  const plan = plans.find((row) => row.id === planId) ?? plans[0];
  const period =
    plan?.periods.find((row) => row.id === periodId) ?? plan?.periods[0];
  const windowRow =
    PLANTING_WINDOWS.find((row) => row.id === windowId) ?? PLANTING_WINDOWS[0];
  const alert = alerts.find((row) => row.id === alertId) ?? alerts[0];
  const observation =
    observations.find((row) => row.id === observationId) ?? observations[0];
  const historyMonth =
    HISTORICAL_MONTHLY.find((row) => row.id === historyId) ??
    HISTORICAL_MONTHLY[0];
  const historyYear =
    HISTORICAL_YEARS.find((row) => row.id === yearId) ?? HISTORICAL_YEARS[0];
  const fault = faults.find((row) => row.id === faultId) ?? faults[0];

  const openAlerts = alerts.filter((row) => !row.ack).length;
  const activePlan = plan ?? plans[0];
  const activePeriod =
    activePlan?.periods.find((row) => row.id === period?.id) ??
    activePlan?.periods[0];

  /* ---------------- actions ---------------- */

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setUpdatedLabel("Updated just now · live feed");
      toast.notify("Weather feed refreshed from KMD + IBM nowcast", "info");
    }, 900);
  };

  const chooseStation = (id: string) => {
    const next = WEATHER_STATIONS.find((row) => row.id === id);
    if (!next) return;
    setStationId(id);
    setDrawer(null);
    setUpdatedLabel(`Updated just now · ${next.name}`);
    toast.notify(`Now reading from ${next.name}`, "info");
  };

  const addTask = (task: Omit<WeatherTask, "id" | "status">) => {
    setTasks((rows) => [
      { ...task, id: `wt-${Date.now()}-${rows.length}`, status: "Open" },
      ...rows,
    ]);
  };

  const completeTask = (id: string) => {
    setTasks((rows) =>
      rows.map((row) => (row.id === id ? { ...row, status: "Done" } : row)),
    );
    toast.notify("Weather task marked done", "success");
  };

  const ackAlert = (id: string) => {
    setAlerts((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ack: true } : row)),
    );
    setModal(null);
    toast.notify("Alert acknowledged — logged to the farm diary", "success");
  };

  const dismissAlert = (id: string) => {
    setAlerts((rows) => rows.filter((row) => row.id !== id));
    setModal(null);
    toast.notify("Alert dismissed for this farm", "info");
  };

  const toggleRule = (id: string, value: boolean) => {
    setRules((rows) =>
      rows.map((row) => (row.id === id ? { ...row, defaultOn: value } : row)),
    );
  };

  const removeRule = (id: string) => {
    setRules((rows) => rows.filter((row) => row.id !== id));
    setRuleToDelete(null);
    setModal(null);
    toast.notify("Alert rule removed", "info");
  };

  const saveReading = (reading: GaugeObservation) => {
    setObservations((rows) => [reading, ...rows]);
    setModal(null);
    setObsPage(1);
    toast.notify("Rain gauge reading saved to the log", "success");
  };

  const deleteReading = (id: string) => {
    setObservations((rows) => rows.filter((row) => row.id !== id));
    setModal(null);
    toast.notify("Gauge reading deleted", "info");
  };

  const logFault = (row: StationFault) => {
    setFaults((rows) => [row, ...rows]);
    setFaultId(row.id);
    setModal(null);
    toast.notify("Station fault reported to the GrowMO field team", "success");
  };

  const sendMessages = (message: SentMessage) => {
    setMessages((rows) => [message, ...rows]);
    setWallet((balance) => Math.max(0, balance - message.cost));
    setModal(null);
    toast.notify(`${message.channel} sent to ${message.recipients}`, "success");
  };

  const buyPremium = () => {
    setWallet((balance) => Math.max(0, balance - SMS_BUNDLE.price));
    setPremium(true);
    setModal(null);
    toast.notify(
      `${SMS_BUNDLE.credits} SMS credits added to your wallet`,
      "success",
    );
  };

  const syncPeriods = (ids: string[]) => {
    setSyncedPeriodIds((current) => Array.from(new Set([...current, ...ids])));
    setModal(null);
    toast.notify(
      `${ids.length} weather tasks written to the crop plan`,
      "success",
    );
  };

  const exportFile = (
    kind: "conditions" | "forecast" | "season" | "history",
  ) => {
    const lines: string[] = [];
    if (kind === "conditions") {
      lines.push(
        "GrowMO live conditions",
        `${WEATHER_PROFILE.place} · ${updatedLabel}`,
        "",
      );
      lines.push(
        csvLine(["Parameter", "Value", "Unit", "24hr change", "Field action"]),
      );
      for (const row of CURRENT_CONDITIONS) {
        lines.push(
          csvLine([row.label, row.display, row.unit, row.change, row.field]),
        );
      }
    }
    if (kind === "forecast") {
      lines.push(
        "GrowMO 7-day forecast",
        `${WEATHER_PROFILE.place} · ${updatedLabel}`,
        "",
      );
      lines.push(
        csvLine([
          "Day",
          "Condition",
          "Min C",
          "Max C",
          "Rain %",
          "Rain mm",
          "Wind km/h",
          "Humidity %",
          "Spray window",
          "Crop impact",
        ]),
      );
      for (const row of SEVEN_DAY_FORECAST) {
        lines.push(
          csvLine([
            row.label,
            row.conditionText,
            row.min,
            row.max,
            row.rainPct,
            `${row.rainMin}-${row.rainMax}`,
            `${row.wind} ${row.windDir}`,
            row.humidity,
            row.spray,
            row.impact,
          ]),
        );
      }
    }
    if (kind === "season") {
      lines.push(
        "GrowMO seasonal outlook",
        `${WEATHER_PROFILE.county} · Short rains 2026`,
        "",
      );
      lines.push(
        csvLine([
          "Month",
          "Rainfall",
          "Vs average",
          "Temp",
          "Rainy days",
          "Dry spell",
          "Flood risk",
        ]),
      );
      for (const row of SEASONAL_OUTLOOK) {
        lines.push(
          csvLine([
            row.month,
            row.rainfall,
            row.vsAverage,
            row.temp,
            row.rainyDays,
            row.drySpell,
            row.flood,
          ]),
        );
      }
      lines.push("");
      lines.push(csvLine(["Risk", "Level", "Crop", "Window", "Advisory"]));
      for (const row of SEASONAL_ADVISORY) {
        lines.push(
          csvLine([row.risk, row.level, row.crop, row.window, row.advisory]),
        );
      }
    }
    if (kind === "history") {
      lines.push(
        "GrowMO historical climate",
        `${WEATHER_PROFILE.county} · 30-year normals`,
        "",
      );
      lines.push(
        csvLine([
          "Month",
          "Avg rain mm",
          "Avg min C",
          "Avg max C",
          "Rainy days",
          "Dry spell %",
        ]),
      );
      for (const row of HISTORICAL_MONTHLY) {
        lines.push(
          csvLine([
            row.month,
            row.rain,
            row.minT,
            row.maxT,
            row.rainyDays,
            row.drySpell,
          ]),
        );
      }
      lines.push("");
      lines.push(
        csvLine([
          "Year",
          "Season rain mm",
          "Anomaly %",
          "Onset",
          "Cessation",
          "Event",
        ]),
      );
      for (const row of HISTORICAL_YEARS) {
        lines.push(
          csvLine([
            row.year,
            row.rain,
            row.anomaly,
            row.onset,
            row.cessation,
            row.event,
          ]),
        );
      }
    }
    downloadText(`growmo-weather-${kind}.csv`, lines.join("\n"), "text/csv");
    setModal(null);
    toast.notify("Weather report downloaded", "success");
  };

  /* ---------------- list filters ---------------- */

  const filteredWindows = useMemo(() => {
    const query = windowQuery.toLowerCase().trim();
    return PLANTING_WINDOWS.filter((row) => {
      const matchesQuery =
        `${row.county} ${row.crop} ${row.variety} ${row.aez} ${row.swahili}`
          .toLowerCase()
          .includes(query);
      const matchesGroup = windowGroup === "All" || row.group === windowGroup;
      const matchesCounty =
        windowCounty === "All" || row.county === windowCounty;
      return matchesQuery && matchesGroup && matchesCounty;
    });
  }, [windowCounty, windowGroup, windowQuery]);

  const filteredAlerts = useMemo(() => {
    const query = alertQuery.toLowerCase().trim();
    return alerts.filter((row) => {
      const matchesQuery =
        `${row.type} ${row.message} ${row.counties} ${row.affected}`
          .toLowerCase()
          .includes(query);
      const matchesFilter =
        alertFilter === "all" ||
        (alertFilter === "open" ? !row.ack : row.severity === alertFilter);
      return matchesQuery && matchesFilter;
    });
  }, [alertFilter, alertQuery, alerts]);

  const filteredStations = useMemo(() => {
    const query = stationQuery.toLowerCase().trim();
    return WEATHER_STATIONS.filter((row) => {
      const matchesQuery =
        `${row.name} ${row.county} ${row.subCounty} ${row.kind}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        stationStatus === "All" || row.status === stationStatus;
      return matchesQuery && matchesStatus;
    });
  }, [stationQuery, stationStatus]);

  const years = useMemo(
    () => (yearRange === "5" ? HISTORICAL_YEARS.slice(0, 5) : HISTORICAL_YEARS),
    [yearRange],
  );

  const windowPages = Math.max(1, Math.ceil(filteredWindows.length / 6));
  const alertPages = Math.max(1, Math.ceil(filteredAlerts.length / 5));
  const stationPages = Math.max(1, Math.ceil(filteredStations.length / 6));
  const yearPages = Math.max(1, Math.ceil(years.length / 5));
  const obsPages = Math.max(1, Math.ceil(observations.length / 5));

  /* changing a filter always drops back to page 1 */
  const changeWindowQuery = (value: string) => {
    setWindowQuery(value);
    setWindowPage(1);
  };
  const changeWindowGroup = (value: string) => {
    setWindowGroup(value);
    setWindowPage(1);
  };
  const changeWindowCounty = (value: string) => {
    setWindowCounty(value);
    setWindowPage(1);
  };
  const changeAlertFilter = (
    value: "all" | "open" | ExtremeAlert["severity"],
  ) => {
    setAlertFilter(value);
    setAlertPage(1);
  };
  const changeAlertQuery = (value: string) => {
    setAlertQuery(value);
    setAlertPage(1);
  };
  const changeStationQuery = (value: string) => {
    setStationQuery(value);
    setStationPage(1);
  };
  const changeStationStatus = (value: string) => {
    setStationStatus(value);
    setStationPage(1);
  };
  const changeYearRange = (value: "5" | "10") => {
    setYearRange(value);
    setYearPage(1);
  };

  const pagedWindows = filteredWindows.slice(
    (windowPage - 1) * 6,
    windowPage * 6,
  );
  const pagedAlerts = filteredAlerts.slice((alertPage - 1) * 5, alertPage * 5);
  const pagedStations = filteredStations.slice(
    (stationPage - 1) * 6,
    stationPage * 6,
  );
  const pagedYears = years.slice((yearPage - 1) * 5, yearPage * 5);
  const pagedObservations = observations.slice((obsPage - 1) * 5, obsPage * 5);

  const openModal = (id: ModalId) => {
    setMenu(null);
    setModal(id);
  };

  /* ============================ render ============================ */

  return (
    <div>
      <Reveal>
        <header className="gm-wx-hero">
          <div className="d-flex flex-wrap gap-4 align-items-start">
            <div style={{ flex: "1 1 300px" }}>
              <span className="gm-eyebrow on-dark">
                <span className="dot" /> Page 8 · Weather & climate intelligence
              </span>
              <div className="d-flex align-items-center gap-3 mt-2">
                <CloudRain width={56} height={56} />
                <div>
                  <span className="gm-wx-temp d-block">
                    {CURRENT_CONDITIONS[0].display}°C
                  </span>
                  <small>
                    Feels like {CURRENT_CONDITIONS[1].display}°C · light rain
                    from 15:00
                  </small>
                </div>
              </div>
              <h1
                className="font-display mt-3 mb-1"
                style={{ color: "var(--gm-card)", fontSize: "1.5rem" }}
              >
                {WEATHER_PROFILE.place}
              </h1>
              <p className="gm-lead on-dark mb-2">
                {WEATHER_PROFILE.farm} · {WEATHER_PROFILE.aez} ·{" "}
                {WEATHER_PROFILE.altitude}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="gm-chip gm-chip-lime">
                  <Radio width={13} height={13} /> {updatedLabel}
                </span>
                <span className="gm-chip gm-chip-ghost">
                  <MapPin width={13} height={13} /> {station.name} ·{" "}
                  {station.distance} km
                </span>
                <span className="gm-chip gm-chip-ghost">
                  <ShieldAlert width={13} height={13} /> {openAlerts} open
                  alerts
                </span>
              </div>
            </div>

            <div style={{ flex: "1 1 320px" }}>
              <div className="gm-wx-strip">
                <div>
                  <small>Season</small>
                  <strong>{WEATHER_PROFILE.season}</strong>
                </div>
                <div>
                  <small>Last rain</small>
                  <strong>{WEATHER_PROFILE.lastRain}</strong>
                </div>
                <div>
                  <small>Next event</small>
                  <strong>{WEATHER_PROFILE.nextEvent}</strong>
                </div>
                <div>
                  <small>Forecast confidence</small>
                  <strong>{WEATHER_PROFILE.confidence}%</strong>
                </div>
                <div>
                  <small>Soil</small>
                  <strong>Humic nitisol</strong>
                </div>
                <div>
                  <small>Grid</small>
                  <strong>NASA POWER 0.5°</strong>
                </div>
              </div>
              <div className="gm-wx-actions mt-3">
                <div className="gm-dropdown">
                  <button
                    type="button"
                    className="gm-btn gm-btn-ghost gm-btn-sm"
                    onClick={() =>
                      setMenu(menu === "station" ? null : "station")
                    }
                    aria-expanded={menu === "station"}
                  >
                    <Radio /> {station.name.split(" ").slice(0, 2).join(" ")}
                  </button>
                  <div className="gm-dropdown-menu gm-app-menu">
                    <p className="gm-app-menu-cap">Nearest stations</p>
                    {WEATHER_STATIONS.slice(0, 5).map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        className={`gm-dropdown-item ${row.id === stationId ? "is-active" : ""}`}
                        onClick={() => chooseStation(row.id)}
                      >
                        {row.status === "online" ? (
                          <Radio width={15} height={15} />
                        ) : (
                          <TriangleAlert width={15} height={15} />
                        )}
                        {row.name} · {row.distance} km
                      </button>
                    ))}
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => {
                        setMenu(null);
                        setDrawer("stations");
                      }}
                    >
                      <Satellite width={15} height={15} /> All{" "}
                      {WEATHER_STATIONS.length} sources
                    </button>
                  </div>
                </div>

                <div className="gm-dropdown">
                  <button
                    type="button"
                    className="gm-btn gm-btn-ghost gm-btn-sm"
                    onClick={() => setMenu(menu === "export" ? null : "export")}
                    aria-expanded={menu === "export"}
                  >
                    <FileDown /> Export
                  </button>
                  <div className="gm-dropdown-menu">
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => exportFile("conditions")}
                    >
                      <Gauge width={15} height={15} /> Live conditions (CSV)
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => exportFile("forecast")}
                    >
                      <CalendarDays width={15} height={15} /> 7-day forecast
                      (CSV)
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => exportFile("season")}
                    >
                      <Sparkles width={15} height={15} /> Seasonal outlook (CSV)
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => exportFile("history")}
                    >
                      <History width={15} height={15} /> Climate normals (CSV)
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => openModal("export")}
                    >
                      <MoreHorizontal width={15} height={15} /> Custom report…
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="gm-btn gm-btn-ghost gm-btn-sm"
                  onClick={() => setDrawer("observations")}
                >
                  <Droplets /> Gauge log ({observations.length})
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost gm-btn-sm"
                  onClick={() => openModal("rules")}
                >
                  <BellRing /> Alert rules
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost gm-btn-sm"
                  onClick={refresh}
                  disabled={refreshing}
                >
                  {refreshing ? <span className="gm-spinner" /> : <RefreshCw />}{" "}
                  {refreshing ? "Syncing…" : "Refresh"}
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => openModal("share")}
                >
                  <Share2 /> Share briefing
                </button>
              </div>
            </div>
          </div>

          {menu ? (
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="gm-drop-close"
              onClick={() => setMenu(null)}
            />
          ) : null}

          {tasks.length ? (
            <div className="gm-card p-3 mt-3">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <span className="gm-eyebrow">Weather tasks created here</span>
                <span className="gm-chip">
                  {tasks.filter((row) => row.status !== "Done").length} open
                </span>
              </div>
              {tasks.map((task) => (
                <div key={task.id} className="gm-check-row">
                  <span className="gm-mega-icon">
                    <ClipboardList />
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong>{task.title}</strong>
                    <small>
                      {task.detail} · {task.plot} · due {task.due} ·{" "}
                      {kes(task.cost)}
                    </small>
                  </span>
                  <StatusChip
                    label={task.status}
                    tone={taskStatusTone(task.status)}
                  />
                  {task.status === "Done" ? (
                    <Check width={16} height={16} />
                  ) : (
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => completeTask(task.id)}
                    >
                      Mark done
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </header>
      </Reveal>

      <div className="mt-3">
        <PlannerSubtabs
          label="Weather modules"
          value={view}
          items={VIEW_ITEMS}
          onChange={(next) => setView(next)}
        />
      </div>

      {view === "now" ? (
        <NowView
          datum={datum}
          datumId={datumId}
          hourSlot={hourSlot}
          day={day}
          station={station}
          onDatum={setDatumId}
          onHour={setHour}
          onDay={(id) => {
            setDayId(id);
            setModal("day");
          }}
          onModal={openModal}
          onDrawer={setDrawer}
        />
      ) : null}

      {view === "outlook" ? (
        <OutlookView
          month={month}
          scenario={scenario}
          onMonth={(id) => setMonthId(id)}
          onOpenMonth={() => setModal("month")}
          onScenario={(id) => setScenarioId(id)}
          onRunScenario={() => setModal("scenario")}
          onAction={(target) => openModal(target)}
          onExport={() => exportFile("season")}
        />
      ) : null}

      {view === "engine" ? (
        <EngineView
          plans={plans}
          plan={activePlan}
          period={activePeriod}
          synced={syncedPeriodIds}
          onPlan={(id) => {
            setPlanId(id);
            const first = plans.find((row) => row.id === id)?.periods[0];
            if (first) setPeriodId(first.id);
          }}
          onPeriod={setPeriodId}
          onOpenPeriod={() => setModal("period")}
          onModal={openModal}
        />
      ) : null}

      {view === "planting" ? (
        <PlantingView
          rows={pagedWindows}
          total={filteredWindows.length}
          page={windowPage}
          pages={windowPages}
          query={windowQuery}
          group={windowGroup}
          county={windowCounty}
          onQuery={changeWindowQuery}
          onGroup={changeWindowGroup}
          onCounty={changeWindowCounty}
          onPage={setWindowPage}
          onDetail={(id) => {
            setWindowId(id);
            setDrawer("window");
          }}
          onPlan={(id) => {
            setWindowId(id);
            setModal("planting-plan");
          }}
        />
      ) : null}

      {view === "alerts" ? (
        <AlertsView
          rows={pagedAlerts}
          all={filteredAlerts}
          archive={ALERT_ARCHIVE}
          messages={messages}
          rules={rules}
          premium={premium}
          page={alertPage}
          pages={alertPages}
          filter={alertFilter}
          query={alertQuery}
          onFilter={changeAlertFilter}
          onQuery={changeAlertQuery}
          onPage={setAlertPage}
          onOpen={(id) => {
            setAlertId(id);
            setModal("confirm-ack");
          }}
          onAction={(id, target) => {
            setAlertId(id);
            setModal(target);
          }}
          onModal={openModal}
          onDismiss={(id) => {
            setAlertId(id);
            setModal("confirm-dismiss");
          }}
          onDrawer={() => setDrawer("alerts")}
        />
      ) : null}

      {view === "history" ? (
        <HistoryView
          historyMonth={historyMonth}
          historyYear={historyYear}
          years={years}
          pagedYears={pagedYears}
          yearPage={yearPage}
          yearPages={yearPages}
          yearRange={yearRange}
          observations={observations}
          pagedObservations={pagedObservations}
          obsPage={obsPage}
          obsPages={obsPages}
          stations={pagedStations}
          allStations={filteredStations}
          stationPage={stationPage}
          stationPages={stationPages}
          stationQuery={stationQuery}
          stationStatus={stationStatus}
          faults={faults}
          onHistory={(id) => setHistoryId(id)}
          onYear={(id) => setYearId(id)}
          onYearRange={changeYearRange}
          onObsPage={setObsPage}
          onYearPage={setYearPage}
          onStationPage={setStationPage}
          onStationQuery={changeStationQuery}
          onStationStatus={changeStationStatus}
          onObservation={(id) => {
            setObservationId(id);
            setModal("observation-detail");
          }}
          onDeleteObservation={(id) => {
            setObservationId(id);
            setModal("confirm-observation");
          }}
          onFault={(id) => {
            setFaultId(id);
            setModal("station-log");
          }}
          onModal={openModal}
          onDrawer={setDrawer}
          onExport={() => exportFile("history")}
        />
      ) : null}

      {/* ============================ drawers ============================ */}

      <DashboardDrawer
        open={drawer === "stations"}
        title="Weather sources & stations"
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setModal("sources");
              }}
            >
              <Info /> Method & accuracy
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setModal("fault");
              }}
            >
              <Wrench /> Report a fault
            </button>
          </>
        }
      >
        <div className="gm-search-field mb-3">
          <Filter />
          <input
            className="gm-input"
            placeholder="Search stations by name or county…"
            value={stationQuery}
            onChange={(event) => changeStationQuery(event.target.value)}
            aria-label="Search stations"
          />
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {["All", "online", "degraded", "offline"].map((status) => (
            <button
              key={status}
              type="button"
              className={`gm-filter-chip ${stationStatus === status ? "is-active" : ""}`}
              onClick={() => changeStationStatus(status)}
            >
              {status === "All" ? "All" : status}
            </button>
          ))}
        </div>
        {filteredStations.map((row) => (
          <button
            key={row.id}
            type="button"
            className={`gm-check-row ${row.id === stationId ? "is-selected" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => chooseStation(row.id)}
          >
            <span className="gm-mega-icon">
              {row.kind.includes("GrowMO") ? <Droplets /> : <Satellite />}
            </span>
            <span style={{ flex: 1 }}>
              <strong>{row.name}</strong>
              <small>
                {row.kind} · {row.distance} km · {row.altitude} · {row.lastPing}
              </small>
            </span>
            <StatusChip
              label={row.status}
              tone={
                row.status === "online"
                  ? "low"
                  : row.status === "degraded"
                    ? "medium"
                    : "high"
              }
            />
          </button>
        ))}
        {filteredStations.length === 0 ? (
          <div className="gm-empty">
            <h4 className="font-display">
              No station matches “{stationQuery}”
            </h4>
            <p className="text-muted">
              Try a county name such as Kiambu or Nyandarua.
            </p>
          </div>
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "alerts"}
        title={`Alert feed · ${alerts.length} active`}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setModal("sms");
              }}
            >
              <MessageSquare /> Broadcast SMS
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setView("alerts");
              }}
            >
              Open alert centre <ArrowRight />
            </button>
          </>
        }
      >
        {alerts.map((row) => (
          <WxAlertCard
            key={row.id}
            alert={row}
            onOpen={() => {
              setAlertId(row.id);
              setDrawer(null);
              setView("alerts");
              setModal("confirm-ack");
            }}
          />
        ))}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "observations"}
        title="Rain gauge log"
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setView("history");
              }}
            >
              <History /> Full history
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setModal("observation");
              }}
            >
              <Plus /> Log a reading
            </button>
          </>
        }
      >
        <p className="gm-wx-note mb-3">
          Your gauge at {WEATHER_PROFILE.place} is the ground truth. GrowMO
          blends it with the KMD station {station.distance} km away.
        </p>
        {observations.map((row) => (
          <div key={row.id} className="gm-check-row">
            <span className="gm-mega-icon">
              <CloudRain />
            </span>
            <span style={{ flex: 1 }}>
              <strong>
                {row.date} · {row.gaugeMm} mm
              </strong>
              <small>
                {row.plot} · station {row.stationMm} mm · {row.by}
              </small>
            </span>
            {row.photo ? (
              <span className="gm-chip">
                <Eye width={13} height={13} /> Photo
              </span>
            ) : null}
          </div>
        ))}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "window"}
        title={
          windowRow
            ? `${windowRow.crop} · ${windowRow.county}`
            : "Planting window"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setModal("compare");
              }}
            >
              <LineChart /> Compare seasons
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setDrawer(null);
                setModal("planting-plan");
              }}
            >
              <Plus /> Plan this window
            </button>
          </>
        }
      >
        {windowRow ? (
          <div>
            <span className="gm-eyebrow">
              {windowRow.group} · {windowRow.aez} · {windowRow.swahili}
            </span>
            <h3 className="font-display mt-1 mb-3">
              {windowRow.crop} — {windowRow.variety}
            </h3>
            <div className="gm-wx-note mb-3">{windowRow.note}</div>
            <div className="gm-wx-fact-grid mb-3">
              <div className="gm-wx-fact">
                <small>Best window</small>
                <strong style={{ fontSize: ".92rem" }}>{windowRow.best}</strong>
              </div>
              <div className="gm-wx-fact">
                <small>Good window</small>
                <strong style={{ fontSize: ".92rem" }}>{windowRow.good}</strong>
              </div>
              <div className="gm-wx-fact">
                <small>Risky</small>
                <strong style={{ fontSize: ".92rem" }}>
                  {windowRow.risky}
                </strong>
              </div>
              <div className="gm-wx-fact">
                <small>Avoid</small>
                <strong style={{ fontSize: ".92rem" }}>
                  {windowRow.avoid}
                </strong>
              </div>
            </div>
            <div className="gm-card p-3 mb-3">
              <span className="gm-eyebrow">Twelve-month window map</span>
              <WxWindowTrack window={windowRow} />
              <div className="mt-2">
                <WxWindowLegend />
              </div>
            </div>
            <div className="gm-check-row">
              <span className="gm-mega-icon">
                <Sparkles />
              </span>
              <span style={{ flex: 1 }}>
                <small>Model confidence</small>
                <strong>{windowRow.confidence}% from 10 seasons</strong>
                <ProgressLine
                  value={windowRow.confidence}
                  label={`${windowRow.crop} window confidence`}
                />
              </span>
            </div>
            <div className="gm-check-row">
              <span className="gm-mega-icon">
                <CloudRain />
              </span>
              <span style={{ flex: 1 }}>
                <small>Rain needed at planting</small>
                <strong>25 mm in the 10 days after sowing</strong>
              </span>
            </div>
            <div className="gm-check-row">
              <span className="gm-mega-icon">
                <FlaskConical />
              </span>
              <span style={{ flex: 1 }}>
                <small>Soil test</small>
                <strong>Test pH before the window opens</strong>
              </span>
            </div>
          </div>
        ) : null}
      </DashboardDrawer>

      {/* ============================ modals ============================ */}

      <Dialog
        open={modal === "station"}
        onClose={() => setModal(null)}
        title="Set up your weather source"
        desc="Three steps · takes about a minute. Nothing is charged."
        wide
      >
        <StationWizard
          stations={WEATHER_STATIONS}
          onDone={(id) => {
            chooseStation(id);
            setModal(null);
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "sources"}
        onClose={() => setModal(null)}
        title="Where your forecast comes from"
        desc="Six sources blended for Githunguri, Kiambu."
        wide
      >
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Provider</th>
                <th>Resolution</th>
                <th>Refresh</th>
                <th>Skill</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <br />
                    <small>{row.use}</small>
                  </td>
                  <td>{row.provider}</td>
                  <td>{row.resolution}</td>
                  <td>{row.refresh}</td>
                  <td>
                    <StatusChip
                      label={`${row.accuracy}%`}
                      tone={
                        row.accuracy >= 92
                          ? "low"
                          : row.accuracy >= 84
                            ? "medium"
                            : "high"
                      }
                    />
                  </td>
                  <td>{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="gm-wx-note mt-3">
          GrowMO weights the nearest ground station highest (60%), the 1 km
          nowcast second (25%) and the satellite grid last (15%). Your own gauge
          always overrides the blend for rain.
        </div>
        <WxModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal(null)}
          >
            Close
          </button>
          <Link to="/contact" className="gm-btn gm-btn-lime">
            <MessageSquare /> Ask the met desk
          </Link>
        </WxModalFooter>
      </Dialog>

      <Dialog
        open={modal === "day"}
        onClose={() => setModal(null)}
        title={`${day.label} · ${day.conditionText}`}
        desc={`Model output in 3-hour blocks · ${WEATHER_PROFILE.place}`}
        wide
      >
        <DayDetailModal
          day={day}
          onSpray={() => {
            setModal(null);
            setModal("spray");
          }}
          onIrrigate={() => {
            setModal(null);
            setModal("irrigation");
          }}
          onShare={() => {
            setModal(null);
            setModal("share");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "spray"}
        onClose={() => setModal(null)}
        title="Spray window planner"
        desc="Checks wind, humidity and rainfastness before you mix a tank."
        wide
      >
        <SprayWizard
          day={day}
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify(`${task.title} scheduled`, "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "irrigation"}
        onClose={() => setModal(null)}
        title="Irrigation planner"
        desc="Works out the deficit from ET₀ and the forecast, then books the round."
        wide
      >
        <IrrigationWizard
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify(`${task.title} scheduled`, "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "drainage"}
        onClose={() => setModal(null)}
        title="Drainage & flood check"
        desc="Heavy rain in the next 6 hours — get water moving off the beds."
      >
        <MitigationTask
          kind="drainage"
          alert={alert}
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Drainage task added to the field list", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "shelter"}
        onClose={() => setModal(null)}
        title="Flood response plan"
        desc="Move livestock and inputs to safe ground before the river peaks."
      >
        <MitigationTask
          kind="shelter"
          alert={alert}
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Flood response tasks scheduled", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "cover"}
        onClose={() => setModal(null)}
        title="Protect crops & structures"
        desc="Frost, wind or hail — cover what you can before it hits."
        wide
      >
        <CoverWizard
          alert={alert}
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Protection tasks scheduled", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "scout"}
        onClose={() => setModal(null)}
        title="Schedule scouting"
        desc="Wet weather drives caterpillars and blight — walk the rows twice a week."
        wide
      >
        <ScoutWizard
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Scouting round scheduled", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "harvest-plan"}
        onClose={() => setModal(null)}
        title="Draft the harvest plan"
        desc="Dry January weather is the best grading window of the season."
        wide
      >
        <HarvestPlanWizard
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Harvest plan drafted and dated", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "sms"}
        onClose={() => setModal(null)}
        title="Broadcast a weather alert"
        desc="SMS your workers and co-op members. Charged per message."
        wide
      >
        <SmsWizard
          alert={alert}
          wallet={wallet}
          premium={premium}
          onSent={sendMessages}
          onBuyPremium={() => setModal("premium")}
        />
      </Dialog>

      <Dialog
        open={modal === "rules"}
        onClose={() => setModal(null)}
        title="Alert rules & channels"
        desc="What you want to be told about, and how."
        wide
      >
        <RulesModal
          rules={rules}
          premium={premium}
          onToggle={toggleRule}
          onDelete={(id) => {
            setRuleToDelete(id);
            setModal("confirm-rule");
          }}
          onSaved={() => {
            setModal(null);
            toast.notify("Alert rules saved", "success");
          }}
          onPremium={() => setModal("premium")}
        />
      </Dialog>

      <Dialog
        open={modal === "confirm-rule"}
        onClose={() => setModal(null)}
        title="Delete this alert rule?"
        desc={rules.find((row) => row.id === ruleToDelete)?.label}
      >
        <p style={{ fontWeight: 600 }}>
          You will stop being warned about{" "}
          {rules.find((row) => row.id === ruleToDelete)?.label?.toLowerCase()}.
          You can add it again from the rules list.
        </p>
        <WxModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal("rules")}
          >
            Keep rule
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => ruleToDelete && removeRule(ruleToDelete)}
          >
            <X /> Delete rule
          </button>
        </WxModalFooter>
      </Dialog>

      <Dialog
        open={modal === "premium"}
        onClose={() => setModal(null)}
        title={SMS_BUNDLE.name}
        desc={`${SMS_BUNDLE.credits} SMS credits · valid ${SMS_BUNDLE.validFor}`}
      >
        <PremiumWizard wallet={wallet} active={premium} onBuy={buyPremium} />
      </Dialog>

      <Dialog
        open={modal === "confirm-ack"}
        onClose={() => setModal(null)}
        title={alert ? `${alert.type} — ${alert.severity}` : "Alert"}
        desc={alert?.counties}
        wide
      >
        <AlertDetailModal
          alert={alert}
          onAck={() => alert && ackAlert(alert.id)}
          onAction={(target) => {
            setModal(null);
            setModal(target);
          }}
          onDismiss={() => {
            setModal(null);
            setModal("confirm-dismiss");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "confirm-dismiss"}
        onClose={() => setModal(null)}
        title="Dismiss this alert?"
        desc={alert?.type}
      >
        <p style={{ fontWeight: 600 }}>
          Dismissing hides “{alert?.type}” for this farm until the next alert of
          the same type. Your mitigation history stays in the log.
        </p>
        <WxModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal("confirm-ack")}
          >
            Keep it
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => alert && dismissAlert(alert.id)}
          >
            <X /> Dismiss alert
          </button>
        </WxModalFooter>
      </Dialog>

      <Dialog
        open={modal === "month"}
        onClose={() => setModal(null)}
        title={`${month.month} in detail`}
        desc="Ten-day (dekadal) breakdown from the KMD seasonal forecast."
        wide
      >
        <MonthDetailModal
          month={month}
          onAdvisory={(target) => {
            setModal(null);
            setModal(target);
          }}
          onExport={() => exportFile("season")}
        />
      </Dialog>

      <Dialog
        open={modal === "scenario"}
        onClose={() => setModal(null)}
        title={`Scenario · ${scenario.name}`}
        desc={scenario.driver}
        wide
      >
        <ScenarioModal
          key={scenarioRun}
          scenario={scenario}
          onPlan={() => {
            setModal(null);
            setModal("irrigation");
          }}
          onClose={() => setModal(null)}
          onRerun={() => setScenarioRun((value) => value + 1)}
        />
      </Dialog>

      <Dialog
        open={modal === "period"}
        onClose={() => setModal(null)}
        title={period ? `${plan?.crop} · ${period.stage}` : "Stage"}
        desc={period?.period}
        wide
      >
        {period && plan ? (
          <PeriodDetailModal
            plan={plan}
            period={period}
            synced={syncedPeriodIds.includes(period.id)}
            onSync={() => syncPeriods([period.id])}
            onIrrigate={() => {
              setModal(null);
              setModal("irrigation");
            }}
            onSpray={() => {
              setModal(null);
              setModal("spray");
            }}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "engine-add"}
        onClose={() => setModal(null)}
        title="Add a crop to the prediction engine"
        desc="GrowMO will model the whole crop cycle against the forecast."
        wide
      >
        <EngineAddWizard
          existing={plans.map((row) => row.crop)}
          onAdd={(next) => {
            setPlans((rows) => [...rows, next]);
            setPlanId(next.id);
            setPeriodId(next.periods[0]?.id ?? "");
            setModal(null);
            toast.notify(
              `${next.crop} modelled for the full season`,
              "success",
            );
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "engine-sync"}
        onClose={() => setModal(null)}
        title="Push advisories to the crop plan"
        desc="Turns weather risks into dated tasks on the crop page."
        wide
      >
        {plan ? (
          <EngineSyncWizard
            plan={plan}
            synced={syncedPeriodIds}
            onSync={syncPeriods}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "planting-plan"}
        onClose={() => setModal(null)}
        title={
          windowRow
            ? `Plan ${windowRow.crop} · ${windowRow.county}`
            : "Plan a window"
        }
        desc="Pick the window, cost the inputs, and schedule the work."
        wide
      >
        {windowRow ? (
          <PlantingPlanWizard
            windowRow={windowRow}
            onSave={(task) => {
              addTask(task);
              setModal(null);
              toast.notify("Planting plan scheduled and budgeted", "success");
            }}
            onPlanner={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "export"}
        onClose={() => setModal(null)}
        title="Custom weather report"
        desc="Choose the sections and download a CSV for your records."
        wide
      >
        <ExportWizard onExport={exportFile} />
      </Dialog>

      <Dialog
        open={modal === "compare"}
        onClose={() => setModal(null)}
        title="Compare seasons"
        desc="Ten years of short-rains outcomes for Kiambu."
        wide
      >
        <CompareYearsModal
          years={HISTORICAL_YEARS}
          selectedId={historyYear.id}
          onSelect={setYearId}
          onExport={() => exportFile("history")}
        />
      </Dialog>

      <Dialog
        open={modal === "observation"}
        onClose={() => setModal(null)}
        title="Log a rain gauge reading"
        desc="Your gauge corrects the model — 30 seconds, twice a day."
        wide
      >
        <ObservationWizard onSave={saveReading} />
      </Dialog>

      <Dialog
        open={modal === "observation-detail"}
        onClose={() => setModal(null)}
        title={observation ? `Reading · ${observation.date}` : "Reading"}
        desc={observation?.plot}
      >
        {observation ? (
          <div>
            <WxFactGrid
              facts={[
                { label: "Your gauge", value: `${observation.gaugeMm} mm` },
                { label: "KMD station", value: `${observation.stationMm} mm` },
                {
                  label: "Variance",
                  value: `${(observation.gaugeMm - observation.stationMm).toFixed(1)} mm`,
                },
                { label: "Recorded by", value: observation.by },
              ]}
            />
            <p className="mt-3" style={{ fontWeight: 600 }}>
              {observation.note}
            </p>
            {observation.photo ? (
              <div className="gm-check-row">
                <span className="gm-mega-icon">
                  <Eye />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>Field photo attached</strong>
                  <small>
                    Used to verify waterlogging claims for insurance
                  </small>
                </span>
              </div>
            ) : null}
            <WxModalFooter>
              <button
                type="button"
                className="gm-btn gm-btn-danger-soft"
                onClick={() => setModal("confirm-observation")}
              >
                <X /> Delete reading
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => setModal(null)}
              >
                Done
              </button>
            </WxModalFooter>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "confirm-observation"}
        onClose={() => setModal(null)}
        title="Delete this gauge reading?"
        desc={
          observation ? `${observation.date} · ${observation.gaugeMm} mm` : ""
        }
      >
        <p style={{ fontWeight: 600 }}>
          Deleting removes it from the season total and from any insurance claim
          evidence. This cannot be undone.
        </p>
        <WxModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal("observation-detail")}
          >
            Keep reading
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => observation && deleteReading(observation.id)}
          >
            <X /> Delete
          </button>
        </WxModalFooter>
      </Dialog>

      <Dialog
        open={modal === "fault"}
        onClose={() => setModal(null)}
        title="Report a station fault"
        desc="GrowMO field technicians cover Kiambu, Nairobi and Nyandarua."
        wide
      >
        <FaultModal stations={WEATHER_STATIONS} onSave={logFault} />
      </Dialog>

      <Dialog
        open={modal === "station-log"}
        onClose={() => setModal(null)}
        title="Station maintenance log"
        desc={`${faults.length} entries · newest first`}
        wide
      >
        <StationLogModal
          faults={faults}
          selected={fault}
          onReport={() => {
            setModal(null);
            setModal("fault");
          }}
          onResolve={(id) => {
            setFaults((rows) =>
              rows.map((row) =>
                row.id === id
                  ? {
                      ...row,
                      status: "Resolved",
                      technician: "Mary Wanjiku",
                      eta: "Closed today",
                    }
                  : row,
              ),
            );
            toast.notify("Fault marked resolved", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "share"}
        onClose={() => setModal(null)}
        title="Share the weather briefing"
        desc="Send today's summary and the 7-day outlook to your team."
        wide
      >
        <ShareWizard station={station} onSent={sendMessages} />
      </Dialog>

      <Dialog
        open={modal === "et0"}
        onClose={() => setModal(null)}
        title="Water budget calculator"
        desc="FAO-56 ET₀ × crop coefficient, minus forecast rain."
        wide
      >
        <Et0Modal />
      </Dialog>
    </div>
  );
}

/* ==========================================================================
   8.1 + 8.2 — LIVE NOW
   ========================================================================== */

function NowView({
  datum,
  datumId,
  hourSlot,
  day,
  station,
  onDatum,
  onHour,
  onDay,
  onModal,
  onDrawer,
}: {
  datum: (typeof CURRENT_CONDITIONS)[number];
  datumId: string;
  hourSlot: (typeof HOURLY_TODAY)[number];
  day: ForecastDay;
  station: WeatherStation;
  onDatum: (id: string) => void;
  onHour: (hour: string) => void;
  onDay: (id: string) => void;
  onModal: (id: ModalId) => void;
  onDrawer: (id: DrawerId) => void;
}) {
  const sprayDays = SEVEN_DAY_FORECAST.filter(
    (row) => row.spray === "Good window",
  );

  return (
    <div>
      {/* ---------- 8.1 current conditions ---------- */}
      <Reveal>
        <section className="gm-dash-card mt-3">
          <DashboardSectionHeader
            eyebrow={`Section 8.1 · ${CURRENT_CONDITIONS.length} live parameters`}
            title="Current conditions"
            subtitle={`${station.name} · ${station.distance} km · ${station.lastPing} · blended with your own gauge`}
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("et0")}
                >
                  <Droplets /> Water budget
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("fault")}
                >
                  <Wrench /> Report fault
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("observation")}
                >
                  <Plus /> Log gauge reading
                </button>
              </div>
            }
          />

          <div className="gm-wx-now-grid">
            {CURRENT_CONDITIONS.map((row) => (
              <WxConditionTile
                key={row.id}
                datum={row}
                selected={row.id === datumId}
                onSelect={() => onDatum(row.id)}
              />
            ))}
          </div>

          <div className="mt-3">
            <WxConditionDetail datum={datum} />
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Kiswahili</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>24hr change</th>
                  <th>Reading</th>
                  <th>Field action</th>
                </tr>
              </thead>
              <tbody>
                {CURRENT_CONDITIONS.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.label}</strong>
                    </td>
                    <td>{row.swahili}</td>
                    <td className="font-display">{row.display}</td>
                    <td>{row.unit || "—"}</td>
                    <td>
                      <StatusChip
                        label={row.change}
                        tone={row.tone === "neutral" ? "neutral" : row.tone}
                      />
                    </td>
                    <td>{row.note}</td>
                    <td>{row.field}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* ---------- hourly strip ---------- */}
      <Reveal>
        <section className="gm-dash-card mt-3">
          <DashboardSectionHeader
            eyebrow="Hour by hour"
            title="Today's field window"
            subtitle="Tap an hour to see what the model expects — sprayers come down two hours before rain."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onModal("spray")}
              >
                <FlaskConical /> Plan a spray
              </button>
            }
          />
          <WxHourlyStrip
            hours={HOURLY_TODAY}
            selected={hourSlot.hour}
            onSelect={onHour}
          />
          <div className="gm-wx-note mt-2">
            <strong>
              {hourSlot.hour} · {hourSlot.temp}°C · {hourSlot.rainPct}% rain ·{" "}
              {hourSlot.wind} km/h wind.
            </strong>{" "}
            {hourSlot.label}.
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <span className="gm-chip">
              <Check width={13} height={13} /> Good spray window 10:00–13:00
            </span>
            <span className="gm-chip">
              <CloudRain width={13} height={13} /> Rain from 15:00 ·{" "}
              {day.rainMin}–{day.rainMax} mm
            </span>
            <span className="gm-chip">
              <Wind width={13} height={13} /> Wind peaks {day.wind} km/h{" "}
              {day.windDir}
            </span>
            <span className="gm-chip">
              <Sun width={13} height={13} /> UV 6 at midday
            </span>
          </div>
        </section>
      </Reveal>

      {/* ---------- 8.2 seven-day forecast ---------- */}
      <Reveal>
        <section className="mt-4">
          <DashboardSectionHeader
            eyebrow={`Section 8.2 · 7-day forecast · ${sprayDays.length} good spray days`}
            title="Field forecast for the week"
            subtitle="Every day carries a spray decision and a crop impact note for your plots."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onDrawer("alerts")}
              >
                <BellRing /> Alert feed
              </button>
            }
          />
          <div className="gm-wx-days">
            {SEVEN_DAY_FORECAST.map((row) => (
              <WxDayCard
                key={row.id}
                day={row}
                selected={row.id === day.id}
                onSelect={() => onDay(row.id)}
              />
            ))}
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Condition</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Rain %</th>
                  <th>Rain mm</th>
                  <th>Wind</th>
                  <th>Humidity</th>
                  <th>UV</th>
                  <th>ET₀</th>
                  <th>Crop impact</th>
                  <th>Spray window</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {SEVEN_DAY_FORECAST.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.label}</strong>
                      <br />
                      <small>{row.date}</small>
                    </td>
                    <td>{row.conditionText}</td>
                    <td className="font-display">{row.min}°</td>
                    <td className="font-display">{row.max}°</td>
                    <td className="font-display">{row.rainPct}%</td>
                    <td className="font-display">
                      {row.rainMin}–{row.rainMax}
                    </td>
                    <td>
                      {row.wind} {row.windDir}
                    </td>
                    <td className="font-display">{row.humidity}%</td>
                    <td className="font-display">{row.uv}</td>
                    <td className="font-display">{row.et} mm</td>
                    <td>{row.impact}</td>
                    <td>
                      <StatusChip label={row.spray} tone={row.tone} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline gm-btn-sm"
                        onClick={() => onDay(row.id)}
                      >
                        <Eye /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* ---------- quick actions ---------- */}
      <Reveal>
        <section className="mt-4">
          <DashboardSectionHeader
            eyebrow="Act on the forecast"
            title="Weather-driven work"
            subtitle="Each of these opens a real planner — nothing here is a placeholder."
          />
          <div className="gm-stat-grid">
            <button
              type="button"
              className="gm-stat"
              style={{ textAlign: "left" }}
              onClick={() => onModal("spray")}
            >
              <span className="gm-mega-icon">
                <FlaskConical />
              </span>
              <strong className="gm-stat-value font-display">
                Spray window
              </strong>
              <span className="gm-stat-label">
                Check wind, humidity, rainfastness
              </span>
              <small className="gm-stat-sub">
                8 products · PHI & drift rules
              </small>
            </button>
            <button
              type="button"
              className="gm-stat"
              style={{ textAlign: "left" }}
              onClick={() => onModal("irrigation")}
            >
              <span className="gm-mega-icon">
                <Droplets />
              </span>
              <strong className="gm-stat-value font-display">Irrigation</strong>
              <span className="gm-stat-label">
                Deficit from ET₀ minus forecast rain
              </span>
              <small className="gm-stat-sub">
                5 plots · drip, furrow, rain gun
              </small>
            </button>
            <button
              type="button"
              className="gm-stat"
              style={{ textAlign: "left" }}
              onClick={() => onModal("sms")}
            >
              <span className="gm-mega-icon">
                <MessageSquare />
              </span>
              <strong className="gm-stat-value font-display">Broadcast</strong>
              <span className="gm-stat-label">
                Warn the crew in EN or Kiswahili
              </span>
              <small className="gm-stat-sub">
                10 contacts · SMS, WhatsApp, push
              </small>
            </button>
            <button
              type="button"
              className="gm-stat"
              style={{ textAlign: "left" }}
              onClick={() => onModal("rules")}
            >
              <span className="gm-mega-icon">
                <BellRing />
              </span>
              <strong className="gm-stat-value font-display">
                Alert rules
              </strong>
              <span className="gm-stat-label">
                Thresholds for rain, frost, wind
              </span>
              <small className="gm-stat-sub">{ALERT_RULES.length} rules</small>
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ==========================================================================
   8.3 — SEASONAL OUTLOOK
   ========================================================================== */

function OutlookView({
  month,
  scenario,
  onMonth,
  onOpenMonth,
  onScenario,
  onRunScenario,
  onAction,
  onExport,
}: {
  month: (typeof SEASONAL_OUTLOOK)[number];
  scenario: (typeof WEATHER_SCENARIOS)[number];
  onMonth: (id: string) => void;
  onOpenMonth: () => void;
  onScenario: (id: string) => void;
  onRunScenario: () => void;
  onAction: (target: ModalId) => void;
  onExport: () => void;
}) {
  const parameterRows: { label: string; values: string[] }[] = [
    {
      label: "Rainfall (mm)",
      values: SEASONAL_OUTLOOK.map((row) => row.rainfall),
    },
    {
      label: "vs long-term average",
      values: SEASONAL_OUTLOOK.map((row) => row.vsAverage),
    },
    {
      label: "Temperature range",
      values: SEASONAL_OUTLOOK.map((row) => row.temp),
    },
    {
      label: "Onset of rains",
      values: SEASONAL_OUTLOOK.map((row) => row.onset),
    },
    {
      label: "Cessation",
      values: SEASONAL_OUTLOOK.map((row) => row.cessation),
    },
    {
      label: "Dry spell risk",
      values: SEASONAL_OUTLOOK.map((row) => row.drySpell),
    },
    { label: "Flood risk", values: SEASONAL_OUTLOOK.map((row) => row.flood) },
    {
      label: "Expected rainy days",
      values: SEASONAL_OUTLOOK.map((row) => row.rainyDays),
    },
  ];

  return (
    <div>
      <Reveal>
        <section className="gm-dash-card mt-3">
          <DashboardSectionHeader
            eyebrow="Section 8.3 · Short rains 2026 (Oct–Dec) · Kiambu County"
            title="Three-month seasonal outlook"
            subtitle="Kenya Met Department seasonal forecast plus the GrowMO crop interpretation."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onOpenMonth}
                >
                  <CalendarDays /> Month detail
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={onExport}
                >
                  <Download /> Export outlook
                </button>
              </div>
            }
          />

          <div className="gm-wx-months">
            {SEASONAL_OUTLOOK.map((row) => (
              <WxMonthCard
                key={row.id}
                month={row}
                selected={row.id === month.id}
                onSelect={() => onMonth(row.id)}
              />
            ))}
          </div>

          <div className="mt-3">
            <WxDekadalGrid month={month} />
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  {SEASONAL_OUTLOOK.map((row) => (
                    <th key={row.id}>{row.month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parameterRows.map((row) => (
                  <tr key={row.label}>
                    <td>
                      <strong>{row.label}</strong>
                    </td>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.label}-${SEASONAL_OUTLOOK[index].id}`}
                        className={
                          row.label.includes("Rainfall") ? "font-display" : ""
                        }
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="gm-wx-note warn mt-3">
            Seasonal skill for Kiambu short rains is about 70% at one month
            lead. Treat this as a plan with a contingency, not a promise — the
            December dry spell is the part worth budgeting for.
          </div>
        </section>
      </Reveal>

      {/* ---------- AI advisory ---------- */}
      <Reveal>
        <section className="mt-4">
          <DashboardSectionHeader
            eyebrow="GrowMO AI seasonal advisory · Cabbage, Kiambu, planted 20 Oct"
            title="What this season does to your crop"
            subtitle="Six risks ranked by the weather, each with an action you can schedule now."
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Level</th>
                  <th>Crop / plot</th>
                  <th>Window</th>
                  <th>Advisory</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {SEASONAL_ADVISORY.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.risk}</strong>
                      <br />
                      <small>{row.swahili}</small>
                    </td>
                    <td>
                      <StatusChip label={row.level} tone={row.level} />
                    </td>
                    <td>{row.crop}</td>
                    <td>{row.window}</td>
                    <td>{row.advisory}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline gm-btn-sm"
                        onClick={() => onAction(row.actionModal)}
                      >
                        {row.action} <ArrowRight width={14} height={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* ---------- scenarios ---------- */}
      <Reveal>
        <section className="mt-4">
          <DashboardSectionHeader
            eyebrow="Scenario planning"
            title="What if the season behaves differently?"
            subtitle="Four ensembles from Copernicus C3S, KMD and NASA POWER. Run one to see the plan change."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={onRunScenario}
              >
                <Activity /> Run selected scenario
              </button>
            }
          />
          <div className="gm-wx-scenarios">
            {WEATHER_SCENARIOS.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`gm-wx-scenario ${row.id === scenario.id ? "on" : ""}`}
                onClick={() => {
                  onScenario(row.id);
                  onRunScenario();
                }}
                aria-pressed={row.id === scenario.id}
              >
                <span className="gm-eyebrow">
                  {Math.round(row.probability)}% likely
                </span>
                <strong className="d-block">{row.name}</strong>
                <span className="gm-wx-prob" aria-hidden="true">
                  <i style={{ width: `${row.probability}%` }} />
                </span>
                <small style={{ fontWeight: 700, color: "var(--gm-ink-600)" }}>
                  {row.rainfall}
                </small>
                <StatusChip label={row.driver} tone={row.tone} />
              </button>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ==========================================================================
   8.4 — CROP-SPECIFIC PREDICTION ENGINE
   ========================================================================== */

function EngineView({
  plans,
  plan,
  period,
  synced,
  onPlan,
  onPeriod,
  onOpenPeriod,
  onModal,
}: {
  plans: CropWeatherPlan[];
  plan: CropWeatherPlan;
  period: CropPeriod;
  synced: string[];
  onPlan: (id: string) => void;
  onPeriod: (id: string) => void;
  onOpenPeriod: () => void;
  onModal: (id: ModalId) => void;
}) {
  const coverage = Math.round((plan.totalRain / plan.totalNeed) * 100);
  const deficitPeriods = plan.periods.filter((row) => row.waterBalance < 0);
  const worst = plan.periods.reduce(
    (acc, row) => (row.waterBalance < acc.waterBalance ? row : acc),
    plan.periods[0],
  );

  return (
    <div>
      <Reveal>
        <section className="mt-3">
          <div
            className="gm-wx-engine-tabs"
            role="tablist"
            aria-label="Modelled crops"
          >
            {plans.map((row) => (
              <button
                key={row.id}
                type="button"
                role="tab"
                aria-selected={row.id === plan.id}
                className={`gm-wx-crop-btn ${row.id === plan.id ? "on" : ""}`}
                onClick={() => onPlan(row.id)}
              >
                <span aria-hidden="true">{row.symbol}</span>
                {row.crop} · {row.variety}
              </button>
            ))}
            <button
              type="button"
              className="gm-wx-crop-btn"
              onClick={() => onModal("engine-add")}
            >
              <Plus width={15} height={15} /> Add crop
            </button>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card">
          <DashboardSectionHeader
            eyebrow={`Section 8.4 · ${plan.duration} · planted ${plan.planted}`}
            title={`${plan.crop} — ${plan.variety}, ${plan.county}`}
            subtitle={`${plan.plot} · ${plan.acres} acre · weather modelled stage by stage for the whole cycle`}
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("engine-sync")}
                >
                  <ClipboardList /> Push to crop plan
                </button>
                <Link to="/app/crops" className="gm-btn gm-btn-soft gm-btn-sm">
                  <Sprout /> Open crop page
                </Link>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={onOpenPeriod}
                >
                  <Eye /> Stage detail
                </button>
              </div>
            }
          />

          <div className="d-flex flex-wrap gap-4 align-items-center">
            <div className="text-center">
              <ScoreRing score={plan.matchScore} size={140} />
              <small
                className="d-block mt-2"
                style={{ fontWeight: 800, color: "var(--gm-ink-400)" }}
              >
                Weather-to-crop match
              </small>
            </div>
            <div style={{ flex: "1 1 320px" }}>
              <WxFactGrid
                facts={[
                  {
                    label: "Predicted season rain",
                    value: `${plan.totalRain} mm`,
                  },
                  { label: "Crop water need", value: `${plan.totalNeed} mm` },
                  { label: "Rain covers", value: `${coverage}%` },
                  {
                    label: "Deficit stages",
                    value: `${deficitPeriods.length}`,
                  },
                  { label: "Worst stage", value: worst.stage },
                  { label: "Planted", value: plan.planted },
                ]}
              />
              <div className="gm-wx-note mt-3">{plan.verdict}</div>
            </div>
          </div>

          <div className="mt-3">
            <WxStageRail
              periods={plan.periods}
              selectedId={period.id}
              onSelect={onPeriod}
            />
          </div>

          <div className="gm-wx-detail mt-3">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="gm-mega-icon">
                <Activity />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="d-block font-display">
                  {period.stage} · days {period.days}
                </strong>
                <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>
                  {period.period} · {plan.crop} {plan.swahili}
                </small>
              </div>
              <StatusChip label={period.match} tone={period.tone} />
            </div>
            <WxFactGrid
              facts={[
                { label: "Predicted rain", value: period.rain },
                { label: "Predicted temp", value: period.temp },
                { label: "Crop needs", value: period.need },
                {
                  label: "Water balance",
                  value: `${period.waterBalance > 0 ? "+" : ""}${period.waterBalance} mm`,
                },
              ]}
            />
            <WxBalanceBar value={period.waterBalance} />
            <p className="mb-0" style={{ fontWeight: 600 }}>
              {period.advisory}
            </p>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("irrigation")}
              >
                <Droplets /> Plan irrigation
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("spray")}
              >
                <FlaskConical /> Plan a spray
              </button>
              {synced.includes(period.id) ? (
                <span className="gm-chip">
                  <Check width={13} height={13} /> Pushed to crop plan
                </span>
              ) : (
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={() => onModal("engine-sync")}
                >
                  <ClipboardList /> Push this stage
                </button>
              )}
            </div>
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Stage</th>
                  <th>Predicted rain</th>
                  <th>Predicted temp</th>
                  <th>Crop need</th>
                  <th>Match</th>
                  <th>Balance</th>
                  <th>Advisory</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plan.periods.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.period}</strong>
                    </td>
                    <td>{row.days}</td>
                    <td>{row.stage}</td>
                    <td className="font-display">{row.rain}</td>
                    <td className="font-display">{row.temp}</td>
                    <td>{row.need}</td>
                    <td>
                      <StatusChip label={row.match} tone={row.tone} />
                    </td>
                    <td>
                      <span className="font-display">
                        {row.waterBalance > 0 ? "+" : ""}
                        {row.waterBalance} mm
                      </span>
                    </td>
                    <td>{row.advisory}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-iconbtn"
                        aria-label={`Open ${row.stage} detail`}
                        onClick={() => {
                          onPeriod(row.id);
                          onOpenPeriod();
                        }}
                      >
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ==========================================================================
   8.5 — PLANTING WINDOW ADVISOR
   ========================================================================== */

function PlantingView({
  rows,
  total,
  page,
  pages,
  query,
  group,
  county,
  onQuery,
  onGroup,
  onCounty,
  onPage,
  onDetail,
  onPlan,
}: {
  rows: PlantingWindow[];
  total: number;
  page: number;
  pages: number;
  query: string;
  group: string;
  county: string;
  onQuery: (value: string) => void;
  onGroup: (value: string) => void;
  onCounty: (value: string) => void;
  onPage: (value: number) => void;
  onDetail: (id: string) => void;
  onPlan: (id: string) => void;
}) {
  const groups = [
    "All",
    "Vegetable",
    "Cereal",
    "Legume",
    "Root",
    "Industrial",
    "Fruit",
  ];
  const counties = [
    "All",
    ...Array.from(new Set(PLANTING_WINDOWS.map((row) => row.county))),
  ];

  return (
    <div>
      <Reveal>
        <section className="gm-dash-card mt-3">
          <DashboardSectionHeader
            eyebrow={`Section 8.5 · ${PLANTING_WINDOWS.length} county–crop windows from 10 seasons`}
            title="Planting window advisor"
            subtitle="Search by county, crop or variety — then plan the window with real input costs."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onPlan(rows[0]?.id ?? PLANTING_WINDOWS[0].id)}
                >
                  <Plus /> Plan a window
                </button>
                <Link
                  to="/app/planner"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                >
                  <Sprout /> Crop planner
                </Link>
              </div>
            }
          />

          <div className="gm-wx-tools">
            <div className="gm-search-field">
              <Filter />
              <input
                className="gm-input"
                placeholder="Search county, crop or variety…"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                aria-label="Search planting windows"
              />
            </div>
            <div className="gm-field mb-0" style={{ minWidth: 170 }}>
              <label htmlFor="window-county">County</label>
              <select
                id="window-county"
                className="gm-select"
                value={county}
                onChange={(event) => onCounty(event.target.value)}
              >
                {counties.map((row) => (
                  <option key={row}>{row}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="gm-tabs" role="tablist" aria-label="Crop group">
            {groups.map((row) => (
              <button
                key={row}
                type="button"
                role="tab"
                aria-selected={group === row}
                className={`gm-tab ${group === row ? "on" : ""}`}
                onClick={() => onGroup(row)}
              >
                {row}
              </button>
            ))}
          </div>

          <WxWindowLegend />

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>County</th>
                  <th>AEZ</th>
                  <th>Crop & variety</th>
                  <th>Group</th>
                  <th>Best window</th>
                  <th>Good window</th>
                  <th>Risky</th>
                  <th>Avoid</th>
                  <th>12-month map</th>
                  <th>Confidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.county}</strong>
                    </td>
                    <td>{row.aez}</td>
                    <td>
                      <strong>{row.crop}</strong>
                      <br />
                      <small>
                        {row.swahili} · {row.variety}
                      </small>
                    </td>
                    <td>{row.group}</td>
                    <td>{row.best}</td>
                    <td>{row.good}</td>
                    <td>{row.risky}</td>
                    <td>{row.avoid}</td>
                    <td>
                      <WxWindowTrack window={row} />
                    </td>
                    <td>
                      <StatusChip
                        label={`${row.confidence}%`}
                        tone={
                          row.confidence >= 88
                            ? "low"
                            : row.confidence >= 82
                              ? "medium"
                              : "high"
                        }
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Open ${row.crop} window detail`}
                          onClick={() => onDetail(row.id)}
                        >
                          <Eye />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Plan ${row.crop} window`}
                          onClick={() => onPlan(row.id)}
                        >
                          <Plus />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      No window matches “{query}”. Try clearing the county
                      filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            total={pages}
            onChange={onPage}
            perPage={6}
            totalItems={total}
          />
        </section>
      </Reveal>
    </div>
  );
}

/* ==========================================================================
   8.6 — EXTREME WEATHER ALERTS
   ========================================================================== */

function AlertsView({
  rows,
  all,
  archive,
  messages,
  rules,
  premium,
  page,
  pages,
  filter,
  query,
  onFilter,
  onQuery,
  onPage,
  onOpen,
  onAction,
  onModal,
  onDismiss,
  onDrawer,
}: {
  rows: ExtremeAlert[];
  all: ExtremeAlert[];
  archive: typeof ALERT_ARCHIVE;
  messages: SentMessage[];
  rules: AlertRule[];
  premium: boolean;
  page: number;
  pages: number;
  filter: "all" | "open" | ExtremeAlert["severity"];
  query: string;
  onFilter: (value: "all" | "open" | ExtremeAlert["severity"]) => void;
  onQuery: (value: string) => void;
  onPage: (value: number) => void;
  onOpen: (id: string) => void;
  onAction: (id: string, target: ModalId) => void;
  onModal: (id: ModalId) => void;
  onDismiss: (id: string) => void;
  onDrawer: () => void;
}) {
  const openCount = all.filter((row) => !row.ack).length;
  const highCount = all.filter((row) => row.tone === "high").length;
  const liveCards = all.slice(0, 3);
  const filters: {
    id: "all" | "open" | ExtremeAlert["severity"];
    label: string;
    count: number;
  }[] = [
    { id: "all", label: "All", count: all.length },
    { id: "open", label: "Not acknowledged", count: openCount },
    {
      id: "Warning",
      label: "Warning",
      count: all.filter((row) => row.severity === "Warning").length,
    },
    {
      id: "Watch",
      label: "Watch",
      count: all.filter((row) => row.severity === "Watch").length,
    },
    {
      id: "Advisory",
      label: "Advisory",
      count: all.filter((row) => row.severity === "Advisory").length,
    },
    {
      id: "Extreme",
      label: "Extreme",
      count: all.filter((row) => row.severity === "Extreme").length,
    },
  ];

  return (
    <div>
      <Reveal>
        <section className="mt-3">
          <WxSummary
            title={`Section 8.6 · ${all.length} alerts, ${openCount} need you`}
            note="Every alert carries a mitigation action you can schedule, acknowledge or broadcast."
            chips={[
              `${highCount} high severity`,
              `${rules.filter((row) => row.defaultOn).length} of ${rules.length} rules on`,
              premium
                ? `${SMS_BUNDLE.credits} SMS credits active`
                : "Standard SMS",
            ]}
            actions={
              <>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost gm-btn-sm"
                  onClick={onDrawer}
                >
                  <BellRing /> Full feed
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost gm-btn-sm"
                  onClick={() => onModal("rules")}
                >
                  <Settings2 /> Alert rules
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("sms")}
                >
                  <MessageSquare /> Broadcast SMS
                </button>
              </>
            }
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-4">
          <DashboardSectionHeader
            eyebrow="Needs attention now"
            title="Live alert cards"
            subtitle="Open a card to acknowledge it, plan the mitigation or warn your crew."
          />
          <div className="d-flex flex-column gap-2">
            {liveCards.map((row) => (
              <WxAlertCard
                key={row.id}
                alert={row}
                onOpen={() => onOpen(row.id)}
              />
            ))}
            {liveCards.length === 0 ? (
              <div className="gm-empty">
                <h4 className="font-display">No alerts right now</h4>
                <p className="text-muted">
                  Your rules are still watching — you will hear from us if that
                  changes.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="All alerts for this farm"
            title="Alert register"
            subtitle="Filter by severity, search the wording, then act."
          />
          <div className="gm-wx-tools">
            <div className="gm-search-field">
              <Filter />
              <input
                className="gm-input"
                placeholder="Search alerts, counties or affected plots…"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                aria-label="Search alerts"
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              {filters.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`gm-filter-chip ${filter === row.id ? "is-active" : ""}`}
                  onClick={() => onFilter(row.id)}
                >
                  {row.label} <span className="gm-n">{row.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Alert</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Counties</th>
                  <th>Affected</th>
                  <th>Issued</th>
                  <th>Valid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.type}</strong>
                      <br />
                      <small>{row.swahili}</small>
                    </td>
                    <td>
                      <StatusChip
                        label={row.severity}
                        tone={severityTone(row.severity)}
                      />
                    </td>
                    <td>{row.message}</td>
                    <td>{row.counties}</td>
                    <td>{row.affected}</td>
                    <td>{row.issued}</td>
                    <td>{row.valid}</td>
                    <td>
                      <StatusChip
                        label={row.ack ? "Acknowledged" : "Open"}
                        tone={row.ack ? "low" : "high"}
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Open ${row.type}`}
                          onClick={() => onOpen(row.id)}
                        >
                          <Eye />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`${row.action} for ${row.type}`}
                          onClick={() => onAction(row.id, row.actionModal)}
                        >
                          <ClipboardList />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn danger"
                          aria-label={`Dismiss ${row.type}`}
                          onClick={() => onDismiss(row.id)}
                        >
                          <X />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      Nothing matches this filter. Clear it to see all alerts.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            total={pages}
            onChange={onPage}
            perPage={5}
            totalItems={all.length}
          />
        </section>
      </Reveal>

      <Reveal>
        <div className="gm-split mt-4" style={{ alignItems: "start" }}>
          <section className="gm-dash-card h-100">
            <DashboardSectionHeader
              eyebrow="Alert rules"
              title="What triggers a message"
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={() => onModal("rules")}
                >
                  <Settings2 /> Edit
                </button>
              }
            />
            {rules.map((rule) => (
              <div key={rule.id} className="gm-check-row">
                <span className="gm-mega-icon">
                  <BellRing />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>
                    {rule.label} · {rule.threshold} {rule.unit}
                  </strong>
                  <small>
                    {rule.desc} · {rule.channels.join(", ")}
                  </small>
                </span>
                <StatusChip
                  label={rule.defaultOn ? "On" : "Off"}
                  tone={rule.defaultOn ? "low" : "neutral"}
                />
              </div>
            ))}
            {!premium ? (
              <button
                type="button"
                className="gm-btn gm-btn-mpesa gm-btn-sm gm-btn-block mt-2"
                onClick={() => onModal("premium")}
              >
                <Smartphone /> Add {SMS_BUNDLE.credits} SMS credits ·{" "}
                {kes(SMS_BUNDLE.price)}
              </button>
            ) : null}
          </section>

          <section className="gm-dash-card h-100">
            <DashboardSectionHeader
              eyebrow="Sent messages"
              title="Broadcast log"
              subtitle={
                messages.length
                  ? "Everything you have sent from this page."
                  : "Nothing sent yet — broadcasts appear here with their M-Pesa reference."
              }
            />
            {messages.map((message) => (
              <div key={message.id} className="gm-check-row">
                <span className="gm-mega-icon">
                  <Send />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>
                    {message.channel} · {message.recipients}
                  </strong>
                  <small>
                    {message.body} · {message.at} · ref {message.ref}
                  </small>
                </span>
                <span className="font-display">{kes(message.cost)}</span>
              </div>
            ))}
            {messages.length === 0 ? (
              <div className="gm-empty">
                <h4 className="font-display">No broadcasts yet</h4>
                <p className="text-muted">
                  Send a storm warning to your crew and it will be logged here.
                </p>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("sms")}
                >
                  <MessageSquare /> Compose a message
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Season archive"
            title="Past extreme weather on this farm"
            subtitle="What it cost, and what you did about it — useful for insurance and for budgeting."
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Severity</th>
                  <th>Detail</th>
                  <th>Outcome</th>
                  <th>Loss</th>
                </tr>
              </thead>
              <tbody>
                {archive.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>
                      <strong>{row.type}</strong>
                    </td>
                    <td>
                      <StatusChip
                        label={row.severity}
                        tone={severityTone(row.severity)}
                      />
                    </td>
                    <td>{row.detail}</td>
                    <td>{row.outcome}</td>
                    <td className="font-display">
                      {row.loss ? kes(row.loss) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ==========================================================================
   8.7 — HISTORICAL WEATHER, GAUGE LOG & STATIONS
   ========================================================================== */

function HistoryView({
  historyMonth,
  historyYear,
  years,
  pagedYears,
  yearPage,
  yearPages,
  yearRange,
  observations,
  pagedObservations,
  obsPage,
  obsPages,
  stations,
  allStations,
  stationPage,
  stationPages,
  stationQuery,
  stationStatus,
  faults,
  onHistory,
  onYear,
  onYearRange,
  onObsPage,
  onYearPage,
  onStationPage,
  onStationQuery,
  onStationStatus,
  onObservation,
  onDeleteObservation,
  onFault,
  onModal,
  onDrawer,
  onExport,
}: {
  historyMonth: HistoryMonth;
  historyYear: (typeof HISTORICAL_YEARS)[number];
  years: (typeof HISTORICAL_YEARS)[number][];
  pagedYears: (typeof HISTORICAL_YEARS)[number][];
  yearPage: number;
  yearPages: number;
  yearRange: "5" | "10";
  observations: GaugeObservation[];
  pagedObservations: GaugeObservation[];
  obsPage: number;
  obsPages: number;
  stations: WeatherStation[];
  allStations: WeatherStation[];
  stationPage: number;
  stationPages: number;
  stationQuery: string;
  stationStatus: string;
  faults: StationFault[];
  onHistory: (id: string) => void;
  onYear: (id: string) => void;
  onYearRange: (value: "5" | "10") => void;
  onObsPage: (value: number) => void;
  onYearPage: (value: number) => void;
  onStationPage: (value: number) => void;
  onStationQuery: (value: string) => void;
  onStationStatus: (value: string) => void;
  onObservation: (id: string) => void;
  onDeleteObservation: (id: string) => void;
  onFault: (id: string) => void;
  onModal: (id: ModalId) => void;
  onDrawer: (id: DrawerId) => void;
  onExport: () => void;
}) {
  const onlineCount = WEATHER_STATIONS.filter(
    (row) => row.status === "online",
  ).length;
  const openFaults = faults.filter((row) => row.status !== "Resolved").length;
  const seasonTotal = HISTORICAL_MONTHLY.reduce(
    (sum, row) => sum + row.rain,
    0,
  );

  return (
    <div>
      <Reveal>
        <section className="gm-dash-card mt-3">
          <DashboardSectionHeader
            eyebrow="Section 8.7 · 30-year normals · Kiambu highlands"
            title="Historical weather for planning"
            subtitle="Long-term averages by month, ten seasons of outcomes, your own gauge log and the stations behind it all."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("compare")}
                >
                  <LineChart /> Compare seasons
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={onExport}
                >
                  <Download /> Export climate data
                </button>
              </div>
            }
          />

          <WxFactGrid
            facts={[
              { label: "Annual average", value: `${seasonTotal} mm` },
              {
                label: "Short rains average",
                value: `${LONG_TERM_AVG.seasonRain} mm`,
              },
              { label: "Average onset", value: LONG_TERM_AVG.onset },
              { label: "Average cessation", value: LONG_TERM_AVG.cessation },
              {
                label: "Rainy days / season",
                value: `${LONG_TERM_AVG.seasonDays}`,
              },
            ]}
          />

          <div className="mt-3">
            <WxRainChart
              months={HISTORICAL_MONTHLY}
              selectedId={historyMonth.id}
              onSelect={onHistory}
            />
          </div>

          <div className="gm-wx-detail mt-3">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="gm-mega-icon">
                <CalendarDays />
              </span>
              <div style={{ flex: 1 }}>
                <strong className="d-block font-display">
                  {historyMonth.month} — long-term average
                </strong>
                <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>
                  {historyMonth.rainyDays} rainy days · dry-spell probability{" "}
                  {historyMonth.drySpell}%
                </small>
              </div>
              <StatusChip
                label={`${historyMonth.rain} mm`}
                tone={
                  historyMonth.rain >= 150
                    ? "low"
                    : historyMonth.rain >= 60
                      ? "medium"
                      : "high"
                }
              />
            </div>
            <WxFactGrid
              facts={[
                { label: "Avg rainfall", value: `${historyMonth.rain} mm` },
                { label: "Avg min temp", value: `${historyMonth.minT}°C` },
                { label: "Avg max temp", value: `${historyMonth.maxT}°C` },
                { label: "Rainy days", value: `${historyMonth.rainyDays}` },
                { label: "Dry spell risk", value: `${historyMonth.drySpell}%` },
              ]}
            />
            <p className="mb-0" style={{ fontWeight: 600 }}>
              {historyMonth.note}
            </p>
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Avg rainfall (mm)</th>
                  <th>Avg min temp</th>
                  <th>Avg max temp</th>
                  <th>Rainy days</th>
                  <th>Dry spell probability</th>
                  <th>Planning note</th>
                </tr>
              </thead>
              <tbody>
                {HISTORICAL_MONTHLY.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.month}</strong>
                    </td>
                    <td className="font-display">{row.rain}</td>
                    <td className="font-display">{row.minT}°C</td>
                    <td className="font-display">{row.maxT}°C</td>
                    <td className="font-display">{row.rainyDays}</td>
                    <td>
                      <StatusChip
                        label={`${row.drySpell}%`}
                        tone={
                          row.drySpell >= 55
                            ? "high"
                            : row.drySpell >= 25
                              ? "medium"
                              : "low"
                        }
                      />
                    </td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Season by season"
            title="Ten years of short-rains outcomes"
            subtitle="Budget on the average, plan for the extremes — 180 mm in 2021 to 620 mm in 2023."
            action={
              <div className="gm-seg">
                {(["5", "10"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={yearRange === value}
                    className={yearRange === value ? "on" : ""}
                    onClick={() => onYearRange(value)}
                  >
                    Last {value}
                  </button>
                ))}
              </div>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Season rain</th>
                  <th>vs average</th>
                  <th>Onset</th>
                  <th>Cessation</th>
                  <th>Rainy days</th>
                  <th>Event</th>
                  <th>Yield note</th>
                </tr>
              </thead>
              <tbody>
                {pagedYears.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong className="font-display">{row.year}</strong>
                    </td>
                    <td className="font-display">{row.rain} mm</td>
                    <td>
                      <StatusChip
                        label={`${row.anomaly > 0 ? "+" : ""}${row.anomaly}%`}
                        tone={row.tone}
                      />
                    </td>
                    <td>{row.onset}</td>
                    <td>{row.cessation}</td>
                    <td className="font-display">{row.rainyDays}</td>
                    <td>{row.event}</td>
                    <td>
                      {row.yieldNote}{" "}
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onYear(row.id)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={yearPage}
            total={yearPages}
            onChange={onYearPage}
            perPage={5}
            totalItems={years.length}
          />
          <div className="gm-wx-note mt-3">
            Selected: <strong>{historyYear.year}</strong> — {historyYear.rain}{" "}
            mm ({historyYear.anomaly > 0 ? "+" : ""}
            {historyYear.anomaly}%), onset {historyYear.onset}, cessation{" "}
            {historyYear.cessation}. {historyYear.event}.{" "}
            {historyYear.yieldNote}.
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow={`${observations.length} readings · your gauge is the ground truth`}
            title="Rain gauge log"
            subtitle="Record twice a day and the model learns your plot's own rainfall."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onDrawer("observations")}
                >
                  <Droplets /> Open log
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("observation")}
                >
                  <Plus /> Log a reading
                </button>
              </div>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plot</th>
                  <th>Your gauge</th>
                  <th>KMD station</th>
                  <th>Variance</th>
                  <th>Recorded by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedObservations.map((row) => (
                  <WxObservationRow
                    key={row.id}
                    observation={row}
                    onOpen={() => onObservation(row.id)}
                    onDelete={() => onDeleteObservation(row.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={obsPage}
            total={obsPages}
            onChange={onObsPage}
            perPage={5}
            totalItems={observations.length}
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow={`${onlineCount} of ${WEATHER_STATIONS.length} sources online · ${openFaults} open faults`}
            title="Stations & data sources"
            subtitle="Everything feeding your forecast, with distance, uptime and last contact."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onDrawer("stations")}
                >
                  <Satellite /> All sources
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("station-log")}
                >
                  <Wrench /> Maintenance log
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("fault")}
                >
                  <TriangleAlert /> Report fault
                </button>
              </div>
            }
          />
          <div className="gm-wx-tools">
            <div className="gm-search-field">
              <Filter />
              <input
                className="gm-input"
                placeholder="Search stations…"
                value={stationQuery}
                onChange={(event) => onStationQuery(event.target.value)}
                aria-label="Search stations"
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              {["All", "online", "degraded", "offline"].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`gm-filter-chip ${stationStatus === status ? "is-active" : ""}`}
                  onClick={() => onStationStatus(status)}
                >
                  {status === "All" ? "All statuses" : status}
                </button>
              ))}
            </div>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>County</th>
                  <th>Type</th>
                  <th>Altitude</th>
                  <th>Distance</th>
                  <th>Uptime</th>
                  <th>Last contact</th>
                  <th>Status</th>
                  <th>Custodian</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>
                      {row.county}
                      <br />
                      <small>{row.subCounty}</small>
                    </td>
                    <td>{row.kind}</td>
                    <td className="font-display">{row.altitude}</td>
                    <td className="font-display">
                      {row.distance ? `${row.distance} km` : "—"}
                    </td>
                    <td>
                      <StatusChip
                        label={row.uptime ? `${row.uptime}%` : "—"}
                        tone={
                          row.uptime >= 97
                            ? "low"
                            : row.uptime >= 80
                              ? "medium"
                              : "high"
                        }
                      />
                    </td>
                    <td>{row.lastPing}</td>
                    <td>
                      <StatusChip
                        label={row.status}
                        tone={
                          row.status === "online"
                            ? "low"
                            : row.status === "degraded"
                              ? "medium"
                              : "high"
                        }
                      />
                    </td>
                    <td>
                      {row.custodian}
                      <br />
                      <small>{row.phone}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Maintenance log for ${row.name}`}
                          onClick={() => onFault(faults[0]?.id ?? "sf-01")}
                        >
                          <Wrench />
                        </button>
                        <button
                          type="button"
                          className="gm-iconbtn"
                          aria-label={`Report a fault on ${row.name}`}
                          onClick={() => onModal("fault")}
                        >
                          <TriangleAlert />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      No station matches “{stationQuery}” with status “
                      {stationStatus}”.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <Pagination
            page={stationPage}
            total={stationPages}
            onChange={onStationPage}
            perPage={6}
            totalItems={allStations.length}
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Method"
            title="How to read this page"
          />
          <div className="gm-split" style={{ alignItems: "start" }}>
            <div>
              {WEATHER_FAQS.map((faq) => (
                <details key={faq.q} className="gm-check-row d-block">
                  <summary style={{ fontWeight: 800, cursor: "pointer" }}>
                    {faq.q}
                  </summary>
                  <p
                    className="mt-2 mb-0"
                    style={{ fontWeight: 600, fontSize: ".85rem" }}
                  >
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
            <div>
              <WxNote tone="info">
                GrowMO is a decision aid, not a meteorological authority. For
                official warnings always follow the Kenya Meteorological
                Department and your county disaster committee.
              </WxNote>
              <div className="gm-check-row mt-3">
                <span className="gm-mega-icon">
                  <Info />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>Data sources & accuracy</strong>
                  <small>Six feeds, weighted, with skill scores</small>
                </span>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("sources")}
                >
                  Open
                </button>
              </div>
              <div className="gm-check-row">
                <span className="gm-mega-icon">
                  <Navigation />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>Change your location</strong>
                  <small>{WEATHER_PROFILE.coords}</small>
                </span>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("station")}
                >
                  Set up
                </button>
              </div>
              <div className="gm-check-row">
                <span className="gm-mega-icon">
                  <Coins />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>SMS credits</strong>
                  <small>{SMS_BUNDLE.note}</small>
                </span>
                <button
                  type="button"
                  className="gm-btn gm-btn-mpesa gm-btn-sm"
                  onClick={() => onModal("premium")}
                >
                  {kes(SMS_BUNDLE.price)}
                </button>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ==========================================================================
   MODALS · station setup, day detail, spray, irrigation, mitigation
   ========================================================================== */

function StationWizard({
  stations,
  onDone,
}: {
  stations: WeatherStation[];
  onDone: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [county, setCounty] = useState("Kiambu");
  const [subCounty, setSubCounty] = useState("Githunguri");
  const [radius, setRadius] = useState("10");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [stationId, setStationId] = useState("st-01");
  const [sources, setSources] = useState({
    kmd: true,
    ibm: true,
    nasa: true,
    community: true,
  });
  const [busy, setBusy] = useState(false);

  const counties = [
    "Kiambu",
    "Nakuru",
    "Meru",
    "Kakamega",
    "Uasin Gishu",
    "Kisumu",
    "Machakos",
    "Kilifi",
    "Nyandarua",
  ];
  const candidates = stations
    .filter(
      (row) =>
        county === "All" || row.county === county || row.county === "National",
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);
  const chosen = stations.find((row) => row.id === stationId) ?? candidates[0];
  const activeSources = Object.values(sources).filter(Boolean).length;

  const scan = () => {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setStationId(candidates[0]?.id ?? "st-01");
    }, 1200);
  };

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onDone(chosen?.id ?? "st-01");
    }, 900);
  };

  return (
    <div>
      <Stepper
        steps={["Location", "Sources", "Confirm"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />

      {step === 0 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <WxField label="County">
              <select
                className="gm-select"
                value={county}
                onChange={(event) => {
                  setCounty(event.target.value);
                  setScanned(false);
                }}
              >
                {counties.map((row) => (
                  <option key={row}>{row}</option>
                ))}
              </select>
            </WxField>
            <WxField label="Sub-county / ward">
              <input
                className="gm-input"
                value={subCounty}
                onChange={(event) => setSubCounty(event.target.value)}
                placeholder="e.g. Githunguri"
              />
            </WxField>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-block"
            onClick={scan}
            disabled={scanning}
          >
            {scanning ? <span className="gm-spinner" /> : <Navigation />}
            {scanning ? "Reading GPS…" : "Use my phone's GPS"}
          </button>
          {scanned ? (
            <div className="gm-wx-detail mt-3">
              <div className="d-flex align-items-center gap-2">
                <span className="gm-mega-icon">
                  <MapPin />
                </span>
                <span style={{ flex: 1 }}>
                  <strong>Locked to {WEATHER_PROFILE.coords}</strong>
                  <small>
                    {subCounty}, {county} · {WEATHER_PROFILE.altitude}
                  </small>
                </span>
                <StatusChip label="GPS fix" tone="low" />
              </div>
              <p className="mb-0" style={{ fontWeight: 700 }}>
                Nearest sources — pick the one you trust most:
              </p>
              {candidates.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`gm-checkcard ${row.id === stationId ? "on" : ""}`}
                  onClick={() => setStationId(row.id)}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={row.id === stationId}
                    tabIndex={-1}
                  />
                  <span style={{ flex: 1 }}>
                    <strong>{row.name}</strong>
                    <small>
                      {row.kind} · {row.distance} km · {row.accuracy}% skill ·{" "}
                      {row.lastPing}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="gm-wx-note mt-3">
              No GPS yet. You can still pick a station manually — GrowMO will
              use the sub-county centre until you do.
            </div>
          )}
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <WxField label="Search radius">
              <select
                className="gm-select"
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
              >
                <option value="2">2 km — farm only</option>
                <option value="10">10 km — sub-county</option>
                <option value="25">25 km — county blend</option>
              </select>
            </WxField>
            <WxField label="Blend mode">
              <select className="gm-select" defaultValue="weighted">
                <option value="weighted">Weighted (recommended)</option>
                <option value="nearest">Nearest station only</option>
                <option value="manual">Manual override</option>
              </select>
            </WxField>
          </div>
          <Toggle
            checked={sources.kmd}
            onChange={(value) =>
              setSources((current) => ({ ...current, kmd: value }))
            }
            label="Kenya Met Department stations"
            desc="Ground truth for rain, wind and temperature"
          />
          <Toggle
            checked={sources.ibm}
            onChange={(value) =>
              setSources((current) => ({ ...current, ibm: value }))
            }
            label="IBM Weather 1 km nowcast"
            desc="Radar-blended rain cells and lightning"
          />
          <Toggle
            checked={sources.nasa}
            onChange={(value) =>
              setSources((current) => ({ ...current, nasa: value }))
            }
            label="NASA POWER satellite grid"
            desc="Radiation, ET₀ and 30-year normals"
          />
          <Toggle
            checked={sources.community}
            onChange={(value) =>
              setSources((current) => ({ ...current, community: value }))
            }
            label="GrowMO community gauges"
            desc="Your own gauge plus neighbouring farmers"
          />
          {activeSources < 2 ? (
            <div className="gm-wx-note danger mt-2">
              Two feeds is the minimum for a reliable blend — turn one more back
              on.
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Linking {chosen?.name}…</h3>
            <p>Fetching the latest observations and rebuilding your blend.</p>
          </div>
        ) : (
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Location</td>
                  <td>
                    <strong>
                      {subCounty}, {county} · {WEATHER_PROFILE.coords}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Primary station</td>
                  <td>
                    <strong>{chosen?.name}</strong> · {chosen?.distance} km
                  </td>
                </tr>
                <tr>
                  <td>Radius</td>
                  <td>{radius} km blend</td>
                </tr>
                <tr>
                  <td>Feeds</td>
                  <td>{activeSources} active sources</td>
                </tr>
                <tr>
                  <td>Cost</td>
                  <td>
                    <strong>Free with GrowMO</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          finishLabel="Link station"
          nextDisabled={
            step === 0 ? !scanned || !subCounty.trim() : activeSources < 2
          }
        />
      ) : null}
    </div>
  );
}

function DayDetailModal({
  day,
  onSpray,
  onIrrigate,
  onShare,
}: {
  day: ForecastDay;
  onSpray: () => void;
  onIrrigate: () => void;
  onShare: () => void;
}) {
  const blocks = dayBlocks(day);
  const Icon = CONDITION_ICONS[day.condition];
  const best = blocks.find((row) => row.spray === "Yes");

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <div style={{ flex: 1 }}>
          <strong className="font-display d-block">
            {day.label} · {day.conditionText}
          </strong>
          <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>
            {day.swahili}
          </small>
        </div>
        <StatusChip label={day.spray} tone={day.tone} />
      </div>

      <WxFactGrid
        facts={[
          { label: "Temperature", value: `${day.min}° – ${day.max}°C` },
          { label: "Rain chance", value: `${day.rainPct}%` },
          { label: "Rain amount", value: `${day.rainMin}–${day.rainMax} mm` },
          { label: "Wind", value: `${day.wind} km/h ${day.windDir}` },
          { label: "Humidity", value: `${day.humidity}%` },
          { label: "UV index", value: `${day.uv}` },
          { label: "ET₀", value: `${day.et} mm` },
          { label: "Field hours", value: day.workHours },
        ]}
      />

      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>3-hour block</th>
              <th>Temp</th>
              <th>Rain %</th>
              <th>Wind</th>
              <th>Humidity</th>
              <th>Spray?</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((row) => (
              <tr key={row.label}>
                <td>
                  <strong>{row.label}</strong>
                </td>
                <td className="font-display">{row.temp}°C</td>
                <td className="font-display">{row.rainPct}%</td>
                <td className="font-display">{row.wind} km/h</td>
                <td className="font-display">{row.humidity}%</td>
                <td>
                  <StatusChip
                    label={row.spray}
                    tone={
                      row.spray === "Yes"
                        ? "low"
                        : row.spray === "Short window"
                          ? "medium"
                          : "high"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`gm-wx-note ${day.tone === "high" ? "danger" : day.tone === "medium" ? "warn" : ""} mt-3`}
      >
        <strong>Crop impact:</strong> {day.impact}.{" "}
        {best
          ? `Best spray block: ${best.label}.`
          : "No safe spray block today — protect the crop instead."}
      </div>

      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onShare}
        >
          <Share2 /> Share this day
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={onIrrigate}
        >
          <Droplets /> Irrigation
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onSpray}>
          <FlaskConical /> Plan a spray
        </button>
      </WxModalFooter>
    </div>
  );
}

function SprayWizard({
  day,
  onSave,
}: {
  day: ForecastDay;
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState("sp-01");
  const [plot, setPlot] = useState("Plot 1: Shamba ya nyumba");
  const [acres, setAcres] = useState("0.5");
  const [operator, setOperator] = useState("Grace Njeri");
  const [when, setWhen] = useState("Monday 10:00");
  const [busy, setBusy] = useState(false);

  const product =
    SPRAY_PRODUCTS.find((row) => row.id === productId) ?? SPRAY_PRODUCTS[0];
  const area = Number(acres) || 0;
  const packs = Math.max(1, Math.ceil(area));
  const cost = product.price * packs;
  const blocks = dayBlocks(day);
  const best = blocks.find((row) => row.spray === "Yes");
  const windOk = day.wind <= product.windLimit;
  const humidityOk = day.humidity <= product.humidityLimit;
  const rainOk = day.rainPct <= 45;
  const allOk = windOk && humidityOk && rainOk;
  const operators = ALERT_CONTACTS.filter((row) =>
    ["Sprayer", "Farm manager", "Farm owner", "Casual · Plot 1"].includes(
      row.role,
    ),
  );

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Spray ${product.name} — ${product.target}`,
        detail: `${product.rate} on ${area} acre · operator ${operator} · ${when} · ${product.rainfast} hr rainfast`,
        due: when,
        plot,
        cost,
        source: "Spray window planner",
      });
    }, 900);
  };

  return (
    <div>
      <Stepper
        steps={["Product", "Conditions", "Schedule"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />

      {step === 0 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <WxField label="Product">
              <select
                className="gm-select"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                {SPRAY_PRODUCTS.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name} · {kes(row.price)}
                  </option>
                ))}
              </select>
            </WxField>
            <WxField label="Plot">
              <select
                className="gm-select"
                value={plot}
                onChange={(event) => setPlot(event.target.value)}
              >
                {IRRIGATION_PLOTS.map((row) => (
                  <option key={row.id}>{row.plot}</option>
                ))}
              </select>
            </WxField>
            <WxField label="Area (acres)">
              <input
                className="gm-input"
                inputMode="decimal"
                value={acres}
                onChange={(event) =>
                  setAcres(
                    event.target.value.replace(/[^\d.]/g, "").slice(0, 5),
                  )
                }
              />
            </WxField>
            <WxField label="Rate">
              <input className="gm-input" value={product.rate} readOnly />
            </WxField>
          </div>
          <div className="gm-wx-fact-grid">
            <div className="gm-wx-fact">
              <small>Active ingredient</small>
              <strong style={{ fontSize: ".85rem" }}>{product.active}</strong>
            </div>
            <div className="gm-wx-fact">
              <small>Pre-harvest interval</small>
              <strong>{product.phi} days</strong>
            </div>
            <div className="gm-wx-fact">
              <small>Rainfast</small>
              <strong>{product.rainfast} hrs</strong>
            </div>
            <div className="gm-wx-fact">
              <small>Packs needed</small>
              <strong>
                {packs} × {product.pack}
              </strong>
            </div>
            <div className="gm-wx-fact">
              <small>Supplier</small>
              <strong style={{ fontSize: ".8rem" }}>{product.supplier}</strong>
            </div>
            <div className="gm-wx-fact">
              <small>Product cost</small>
              <strong className="font-display">{kes(cost)}</strong>
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <div className="gm-check-row mt-3">
            <span className="gm-mega-icon">
              <Wind />
            </span>
            <span style={{ flex: 1 }}>
              <strong>
                Wind {day.wind} km/h {day.windDir}
              </strong>
              <small>
                Drift limit for {product.name} is {product.windLimit} km/h
              </small>
            </span>
            <StatusChip
              label={windOk ? "Pass" : "Too windy"}
              tone={windOk ? "low" : "high"}
            />
          </div>
          <div className="gm-check-row">
            <span className="gm-mega-icon">
              <Droplets />
            </span>
            <span style={{ flex: 1 }}>
              <strong>Humidity {day.humidity}%</strong>
              <small>Evaporation limit is {product.humidityLimit}%</small>
            </span>
            <StatusChip
              label={humidityOk ? "Pass" : "Too humid"}
              tone={humidityOk ? "low" : "high"}
            />
          </div>
          <div className="gm-check-row">
            <span className="gm-mega-icon">
              <CloudRain />
            </span>
            <span style={{ flex: 1 }}>
              <strong>
                Rain chance {day.rainPct}% ({day.rainMin}–{day.rainMax} mm)
              </strong>
              <small>
                Needs {product.rainfast} hours dry after application
              </small>
            </span>
            <StatusChip
              label={rainOk ? "Pass" : "Wash-off risk"}
              tone={rainOk ? "low" : "high"}
            />
          </div>
          <div className={`gm-wx-note ${allOk ? "" : "warn"} mt-3`}>
            {allOk
              ? `${day.label} works. ${best ? `Aim for the ${best.label} block.` : "Spray early, before the cloud builds."}`
              : `${day.label} fails the ${!windOk ? "wind" : !humidityOk ? "humidity" : "rain"} test. GrowMO moved the job to the next good window — Monday 10:00 (40% rain, 10 km/h).`}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Scheduling the spray…</h3>
            <p>Writing the task to {plot} and reserving the product.</p>
          </div>
        ) : (
          <div>
            <div className="gm-form-grid mt-3">
              <WxField label="When">
                <input
                  className="gm-input"
                  value={when}
                  onChange={(event) => setWhen(event.target.value)}
                />
              </WxField>
              <WxField label="Operator">
                <select
                  className="gm-select"
                  value={operator}
                  onChange={(event) => setOperator(event.target.value)}
                >
                  {operators.map((row) => (
                    <option key={row.id}>{row.name}</option>
                  ))}
                </select>
              </WxField>
            </div>
            <div className="gm-wx-receipt">
              <strong className="d-block font-display">
                {product.name} · {area} acre
              </strong>
              <p className="mb-2" style={{ fontWeight: 600 }}>
                {product.target} · {operator} · {when} · PHI {product.phi} days
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="gm-chip">Product {kes(cost)}</span>
                <span className="gm-chip">
                  Labour {kes(Math.round(area * 800))}
                </span>
                <span className="gm-chip gm-chip-gold">
                  Total {kes(cost + Math.round(area * 800))}
                </span>
              </div>
            </div>
          </div>
        )
      ) : null}

      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          finishLabel="Schedule spray"
          nextDisabled={area <= 0 || !when.trim()}
        />
      ) : null}
    </div>
  );
}

function IrrigationWizard({
  onSave,
}: {
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [plotId, setPlotId] = useState("ip-01");
  const [when, setWhen] = useState("Wednesday 06:00");
  const [method, setMethod] = useState("");
  const [busy, setBusy] = useState(false);

  const plot =
    IRRIGATION_PLOTS.find((row) => row.id === plotId) ?? IRRIGATION_PLOTS[0];
  const et0 =
    CURRENT_CONDITIONS.find((row) => row.id === "cc-et")?.value ?? 3.5;
  const deficit = plot.deficitMm;
  const volume = Math.round(deficit * plot.acres * 4.05);
  const rounds = Math.max(1, Math.ceil(deficit / 12));
  const cost = plot.costPerRound * rounds;
  const chosenMethod = method || plot.method;

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Irrigate ${plot.crop} — ${rounds} round${rounds > 1 ? "s" : ""}`,
        detail: `${deficit} mm deficit · ${volume} m³ · ${chosenMethod} · ${when}`,
        due: when,
        plot: plot.plot,
        cost,
        source: "Irrigation planner",
      });
    }, 900);
  };

  return (
    <div>
      <Stepper
        steps={["Plot", "Deficit", "Schedule"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />

      {step === 0 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <WxField label="Plot" full>
              <select
                className="gm-select"
                value={plotId}
                onChange={(event) => setPlotId(event.target.value)}
              >
                {IRRIGATION_PLOTS.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.plot} · {row.crop} · {row.acres} acre
                  </option>
                ))}
              </select>
            </WxField>
          </div>
          <WxFactGrid
            facts={[
              { label: "Soil", value: plot.soil.split(" · ")[0] },
              { label: "Water source", value: plot.source },
              { label: "Soil moisture", value: `${plot.moisture}%` },
              { label: "Method on file", value: plot.method },
            ]}
          />
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Reference ET₀ today</td>
                  <td className="font-display">{et0} mm/day</td>
                </tr>
                <tr>
                  <td>Forecast rain next 7 days</td>
                  <td className="font-display">
                    {SEVEN_DAY_FORECAST.reduce(
                      (sum, row) => sum + (row.rainMin + row.rainMax) / 2,
                      0,
                    ).toFixed(0)}{" "}
                    mm
                  </td>
                </tr>
                <tr>
                  <td>Crop water need this week</td>
                  <td className="font-display">
                    {Math.round(et0 * 7 * plot.acres * 0.9)} mm
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Deficit to cover</strong>
                  </td>
                  <td className="font-display">
                    <strong>{deficit} mm</strong>
                  </td>
                </tr>
                <tr>
                  <td>Water volume</td>
                  <td className="font-display">{volume} m³</td>
                </tr>
                <tr>
                  <td>Rounds needed</td>
                  <td className="font-display">{rounds}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="gm-wx-note mt-3">
            The December dry spell is the real risk — {deficit} mm at heading
            will shrink heads by roughly {Math.round(deficit / 2)}%.
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Booking the pump…</h3>
            <p>
              Reserving {volume} m³ from {plot.source}.
            </p>
          </div>
        ) : (
          <div>
            <div className="gm-form-grid mt-3">
              <WxField label="When">
                <input
                  className="gm-input"
                  value={when}
                  onChange={(event) => setWhen(event.target.value)}
                />
              </WxField>
              <WxField label="Method">
                <select
                  className="gm-select"
                  value={chosenMethod}
                  onChange={(event) => setMethod(event.target.value)}
                >
                  {["Drip lines", "Furrow", "Rain gun", "Watering can"].map(
                    (row) => (
                      <option key={row}>{row}</option>
                    ),
                  )}
                </select>
              </WxField>
            </div>
            <div className="gm-wx-receipt">
              <strong className="d-block font-display">
                {plot.plot} · {plot.crop}
              </strong>
              <p className="mb-2" style={{ fontWeight: 600 }}>
                {deficit} mm · {volume} m³ · {rounds} round
                {rounds > 1 ? "s" : ""} of {chosenMethod.toLowerCase()} · {when}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="gm-chip">
                  {kes(plot.costPerRound)} per round
                </span>
                <span className="gm-chip gm-chip-gold">Total {kes(cost)}</span>
              </div>
            </div>
          </div>
        )
      ) : null}

      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          finishLabel="Schedule irrigation"
          nextDisabled={!when.trim()}
        />
      ) : null}
    </div>
  );
}

const MITIGATION_PRESETS = {
  drainage: {
    title: "Open drainage before the rain",
    detail: "Cut 3 furrows across the low corner and clear the main outlet",
    plot: "Plot 1 low corner",
    crew: 3,
    cost: 2400,
    hours: "07:00 – 12:00",
  },
  shelter: {
    title: "Move livestock & secure the store",
    detail:
      "6 dairy cattle to the high paddock, seed onto pallets, tarp the door",
    plot: "Store & cattle paddock",
    crew: 4,
    cost: 1800,
    hours: "16:00 – 20:00",
  },
} as const;

function MitigationTask({
  kind,
  alert,
  onSave,
}: {
  kind: "drainage" | "shelter";
  alert: ExtremeAlert;
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
}) {
  const preset = MITIGATION_PRESETS[kind];
  const [title, setTitle] = useState<string>(preset.title);
  const [detail, setDetail] = useState<string>(preset.detail);
  const [plot, setPlot] = useState<string>(preset.plot);
  const [crew, setCrew] = useState(String(preset.crew));
  const [cost, setCost] = useState(String(preset.cost));
  const [hours, setHours] = useState<string>(preset.hours);
  const [busy, setBusy] = useState(false);

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: title.trim(),
        detail: `${detail.trim()} · ${crew} people · ${hours}`,
        due: alert.valid,
        plot,
        cost: Number(cost) || 0,
        source: `${alert.type} alert`,
      });
    }, 800);
  };

  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Saving the plan…</h3>
        <p>Adding it to today's field list.</p>
      </div>
    );
  }

  return (
    <div>
      {alert ? (
        <div className="gm-wx-note warn mb-3">
          <strong>
            {alert.type} · {alert.severity}
          </strong>{" "}
          — {alert.message}
        </div>
      ) : null}
      <div className="gm-form-grid">
        <WxField label="Task" full>
          <input
            className="gm-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </WxField>
        <WxField label="What exactly" full>
          <textarea
            className="gm-textarea"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
          />
        </WxField>
        <WxField label="Where">
          <input
            className="gm-input"
            value={plot}
            onChange={(event) => setPlot(event.target.value)}
          />
        </WxField>
        <WxField label="People">
          <input
            className="gm-input"
            inputMode="numeric"
            value={crew}
            onChange={(event) =>
              setCrew(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
          />
        </WxField>
        <WxField label="Cost (KES)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={cost}
            onChange={(event) =>
              setCost(event.target.value.replace(/\D/g, "").slice(0, 7))
            }
          />
        </WxField>
        <WxField label="Time window">
          <input
            className="gm-input"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </WxField>
      </div>
      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() =>
            onSave({
              title: title.trim(),
              detail: `${detail.trim()} · ${crew} people · ${hours}`,
              due: alert.valid,
              plot,
              cost: Number(cost) || 0,
              source: `${alert.type} alert`,
            })
          }
        >
          Save & close
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={finish}>
          Save & notify crew
        </button>
      </WxModalFooter>
    </div>
  );
}

function CoverWizard({
  alert,
  onSave,
}: {
  alert: ExtremeAlert;
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
}) {
  const protections = [
    {
      id: "net",
      label: "Shade / hail net over seedbeds",
      cost: 3200,
      note: "Nursery + Plot 4 tunnel",
    },
    {
      id: "mulch",
      label: "Mulch rows to hold soil heat",
      cost: 1200,
      note: "Frost protection for potatoes",
    },
    {
      id: "brace",
      label: "Brace the greenhouse frame",
      cost: 2600,
      note: "Wind gusts above 35 km/h",
    },
    {
      id: "move",
      label: "Move seedling trays under cover",
      cost: 400,
      note: "15 minutes of work",
    },
    {
      id: "smoke",
      label: "Smudge fires on the cold corner",
      cost: 800,
      note: "Only with a fire permit",
    },
  ];
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<string[]>(["net", "move"]);
  const [when, setWhen] = useState("Today 16:00");
  const [busy, setBusy] = useState(false);
  const total = protections
    .filter((row) => chosen.includes(row.id))
    .reduce((sum, row) => sum + row.cost, 0);

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Protect crops — ${alert.type.toLowerCase()}`,
        detail: `${chosen.length} measures · ${when}`,
        due: when,
        plot: alert.affected,
        cost: total,
        source: `${alert.type} alert`,
      });
    }, 800);
  };

  return (
    <div>
      <Stepper
        steps={["Measures", "Schedule"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div>
          {alert ? (
            <div className="gm-wx-note danger mt-3 mb-2">
              <strong>{alert.type}</strong> — {alert.message}
            </div>
          ) : null}
          {protections.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`gm-checkcard ${chosen.includes(row.id) ? "on" : ""}`}
              onClick={() =>
                setChosen((current) =>
                  current.includes(row.id)
                    ? current.filter((id) => id !== row.id)
                    : [...current, row.id],
                )
              }
            >
              <input
                type="checkbox"
                readOnly
                checked={chosen.includes(row.id)}
                tabIndex={-1}
              />
              <span style={{ flex: 1 }}>
                <strong>{row.label}</strong>
                <small>
                  {row.note} · {kes(row.cost)}
                </small>
              </span>
            </button>
          ))}
          <div className="gm-wx-receipt mt-3">
            <strong className="d-block font-display">
              {chosen.length} measure{chosen.length === 1 ? "" : "s"} ·{" "}
              {kes(total)}
            </strong>
            <small style={{ fontWeight: 700 }}>
              Budgeted from the crop contingency line.
            </small>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Scheduling protection…</h3>
          </div>
        ) : (
          <div className="gm-form-grid mt-3">
            <WxField label="Finish before" full>
              <input
                className="gm-input"
                value={when}
                onChange={(event) => setWhen(event.target.value)}
              />
            </WxField>
            <div className="full">
              <div className="gm-table-wrap">
                <table className="gm-table">
                  <tbody>
                    {protections
                      .filter((row) => chosen.includes(row.id))
                      .map((row) => (
                        <tr key={row.id}>
                          <td>{row.label}</td>
                          <td className="font-display">{kes(row.cost)}</td>
                        </tr>
                      ))}
                    <tr>
                      <td>
                        <strong>Total</strong>
                      </td>
                      <td className="font-display">
                        <strong>{kes(total)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 1 ? finish() : setStep((value) => value + 1))}
          finishLabel="Schedule protection"
          nextDisabled={chosen.length === 0 || !when.trim()}
        />
      ) : null}
    </div>
  );
}

/* ==========================================================================
   MODALS · messaging, rules, alerts
   ========================================================================== */

const SMS_TEMPLATES = [
  {
    id: "tpl-storm",
    label: "Storm warning (EN)",
    body: "GrowMO: Heavy rain 20-30 mm expected 15:00-21:00 today in Githunguri. Stop field work by 14:00 and open the drains. Mary's Farm.",
  },
  {
    id: "tpl-storm-sw",
    label: "Onyo la dhoruba (SW)",
    body: "GrowMO: Mvua kubwa 20-30 mm inatarajiwa 15:00-21:00 leo Githunguri. Acha kazi shambani saa 8 na fungua mifereji. Shamba la Mary.",
  },
  {
    id: "tpl-frost",
    label: "Frost notice (EN)",
    body: "GrowMO: Minimum 2C expected tonight. Cover seedlings and delay transplanting. Mary's Farm.",
  },
  {
    id: "tpl-spray",
    label: "Spray day (EN)",
    body: "GrowMO: Good spray window tomorrow 07:00-11:00. Wind 10 km/h, no rain. Meet at the store. Mary's Farm.",
  },
  {
    id: "tpl-dry",
    label: "Dry spell (EN)",
    body: "GrowMO: No rain for 14 days from 15 Dec. Irrigation rounds start Wednesday 06:00. Mary's Farm.",
  },
];

function SmsWizard({
  alert,
  wallet,
  premium,
  onSent,
  onBuyPremium,
}: {
  alert: ExtremeAlert;
  wallet: number;
  premium: boolean;
  onSent: (message: SentMessage) => void;
  onBuyPremium: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(
    ALERT_CONTACTS.filter((row) => row.active)
      .slice(0, 6)
      .map((row) => row.id),
  );
  const [templateId, setTemplateId] = useState("tpl-storm");
  const [body, setBody] = useState(SMS_TEMPLATES[0].body);
  const [channel, setChannel] = useState("SMS");
  const [pay, setPay] = useState<"wallet" | "mpesa">("wallet");
  const [pinKey, setPinKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const contacts = ALERT_CONTACTS.filter((row) => selected.includes(row.id));
  const cost = Math.max(2, contacts.length * 2);
  const insufficient = pay === "wallet" && cost > wallet;

  const send = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSent({
        id: `msg-${Date.now()}`,
        channel,
        recipients: `${contacts.length} people`,
        body: body.slice(0, 90) + (body.length > 90 ? "…" : ""),
        cost,
        at: "just now",
        ref: `GM${Math.floor(100000 + Math.random() * 899999)}`,
      });
    }, 1100);
  };

  return (
    <div>
      <Stepper
        steps={["Recipients", "Message", "Send"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />

      {step === 0 ? (
        <div>
          {alert ? (
            <div className="gm-wx-note warn mt-3 mb-2">
              Triggered by <strong>{alert.type}</strong> · {alert.valid}
            </div>
          ) : null}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              className="gm-chipbtn"
              onClick={() =>
                setSelected(
                  ALERT_CONTACTS.filter((row) => row.active).map(
                    (row) => row.id,
                  ),
                )
              }
            >
              Select all active
            </button>
            <button
              type="button"
              className="gm-chipbtn"
              onClick={() =>
                setSelected(
                  ALERT_CONTACTS.filter((row) =>
                    [
                      "Sprayer",
                      "Irrigation",
                      "Casual · Plot 1",
                      "Casual · Plot 2",
                      "Watchman",
                    ].includes(row.role),
                  ).map((row) => row.id),
                )
              }
            >
              Field crew only
            </button>
            <button
              type="button"
              className="gm-chipbtn"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
          {ALERT_CONTACTS.map((row) => (
            <WxContactRow
              key={row.id}
              contact={row}
              selected={selected.includes(row.id)}
              onToggle={() =>
                setSelected((current) =>
                  current.includes(row.id)
                    ? current.filter((id) => id !== row.id)
                    : [...current, row.id],
                )
              }
            />
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <WxField label="Template">
              <select
                className="gm-select"
                value={templateId}
                onChange={(event) => {
                  const next =
                    SMS_TEMPLATES.find(
                      (row) => row.id === event.target.value,
                    ) ?? SMS_TEMPLATES[0];
                  setTemplateId(next.id);
                  setBody(next.body);
                }}
              >
                {SMS_TEMPLATES.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </WxField>
            <WxField label="Channel">
              <select
                className="gm-select"
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
              >
                <option>SMS</option>
                <option>WhatsApp</option>
                <option>SMS + WhatsApp</option>
              </select>
            </WxField>
          </div>
          <WxField label="Message" full>
            <textarea
              className="gm-textarea"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </WxField>
          <div className="d-flex flex-wrap gap-2">
            <span className="gm-chip">{body.length} characters</span>
            <span className="gm-chip">
              {Math.max(1, Math.ceil(body.length / 160))} SMS part
              {Math.ceil(body.length / 160) > 1 ? "s" : ""} per person
            </span>
            <span className="gm-chip gm-chip-gold">{kes(cost)} total</span>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Sending {channel}…</h3>
            <p>Delivering to {contacts.length} people.</p>
          </div>
        ) : (
          <div>
            <div className="gm-wx-receipt mb-3">
              <strong className="d-block font-display">
                {contacts.length} recipients · {kes(cost)}
              </strong>
              <p className="mb-0" style={{ fontWeight: 600 }}>
                {body}
              </p>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {contacts.map((row) => (
                  <span key={row.id} className="gm-chip">
                    {row.name.split(" ")[0]} {row.phone}
                  </span>
                ))}
              </div>
            </div>
            <div className="gm-method-grid">
              <button
                type="button"
                className={`gm-method ${pay === "wallet" ? "is-active" : ""}`}
                onClick={() => setPay("wallet")}
              >
                <strong>GrowMO Wallet</strong>
                <small>{kes(wallet)} balance</small>
              </button>
              <button
                type="button"
                className={`gm-method ${pay === "mpesa" ? "is-active" : ""}`}
                onClick={() => {
                  setPay("mpesa");
                  setPinKey((key) => key + 1);
                }}
              >
                <strong>M-Pesa · 0712 ••• 678</strong>
                <small>STK push to your phone</small>
              </button>
            </div>
            {insufficient ? (
              <div className="gm-wx-note danger mt-3">
                Wallet balance is short by {kes(cost - wallet)}.{" "}
                <button
                  type="button"
                  className="gm-btn gm-btn-mpesa gm-btn-sm"
                  onClick={onBuyPremium}
                >
                  Buy {SMS_BUNDLE.credits} credits · {kes(SMS_BUNDLE.price)}
                </button>
              </div>
            ) : null}
            {pay === "mpesa" ? (
              <div className="mt-3">
                <PinPad
                  resetKey={pinKey}
                  actionLabel={`Enter your M-Pesa PIN to send ${kes(cost)}`}
                  onComplete={send}
                />
              </div>
            ) : null}
            {!premium ? (
              <p
                className="mt-2 mb-0"
                style={{
                  fontSize: ".8rem",
                  fontWeight: 700,
                  color: "var(--gm-ink-400)",
                }}
              >
                Tip: {SMS_BUNDLE.name} gives you {SMS_BUNDLE.credits} credits
                for {kes(SMS_BUNDLE.price)}.
              </p>
            ) : null}
          </div>
        )
      ) : null}

      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() =>
            step === 2
              ? pay === "wallet"
                ? send()
                : undefined
              : setStep((value) => value + 1)
          }
          finishLabel={pay === "wallet" ? "Send now" : "Waiting for PIN…"}
          nextDisabled={
            step === 0
              ? selected.length === 0
              : step === 1
                ? !body.trim()
                : insufficient || pay === "mpesa"
          }
        />
      ) : null}
    </div>
  );
}

function RulesModal({
  rules,
  premium,
  onToggle,
  onDelete,
  onSaved,
  onPremium,
}: {
  rules: AlertRule[];
  premium: boolean;
  onDelete: (id: string) => void;
  onToggle: (id: string, value: boolean) => void;
  onSaved: () => void;
  onPremium: () => void;
}) {
  const [thresholds, setThresholds] = useState<Record<string, string>>(
    Object.fromEntries(rules.map((row) => [row.id, String(row.threshold)])),
  );

  return (
    <div>
      {!premium ? (
        <div className="gm-wx-note warn mb-3">
          Standard SMS covers 5 alerts a month.{" "}
          <button
            type="button"
            className="gm-btn gm-btn-mpesa gm-btn-sm"
            onClick={onPremium}
          >
            Add {SMS_BUNDLE.credits} credits · {kes(SMS_BUNDLE.price)}
          </button>
        </div>
      ) : (
        <div className="gm-wx-note mb-3">
          {SMS_BUNDLE.name} active — {SMS_BUNDLE.credits} credits, valid{" "}
          {SMS_BUNDLE.validFor}.
        </div>
      )}
      {rules.map((rule) => (
        <div key={rule.id} className="gm-check-row">
          <span style={{ flex: 1 }}>
            <strong>
              {rule.label} · {rule.swahili}
            </strong>
            <small>{rule.desc}</small>
          </span>
          <div className="d-flex align-items-center gap-2">
            <input
              className="gm-input"
              style={{ width: 84, padding: ".4rem .6rem" }}
              inputMode="numeric"
              aria-label={`${rule.label} threshold`}
              value={thresholds[rule.id] ?? String(rule.threshold)}
              onChange={(event) =>
                setThresholds((current) => ({
                  ...current,
                  [rule.id]: event.target.value.replace(/\D/g, "").slice(0, 4),
                }))
              }
            />
            <span style={{ fontWeight: 700, fontSize: ".78rem" }}>
              {rule.unit}
            </span>
            <button
              type="button"
              className="gm-iconbtn danger"
              aria-label={`Delete ${rule.label} rule`}
              onClick={() => onDelete(rule.id)}
            >
              <X />
            </button>
          </div>
          <div style={{ flex: "0 0 132px" }}>
            <Toggle
              checked={rule.defaultOn}
              onChange={(value) => onToggle(rule.id, value)}
              label={rule.defaultOn ? "On" : "Off"}
            />
          </div>
        </div>
      ))}
      <WxModalFooter>
        <span
          className="me-auto align-self-center"
          style={{
            fontWeight: 700,
            fontSize: ".8rem",
            color: "var(--gm-ink-400)",
          }}
        >
          {rules.filter((row) => row.defaultOn).length} of {rules.length} rules
          active
        </span>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onSaved}>
          <Check /> Save rules
        </button>
      </WxModalFooter>
    </div>
  );
}

function PremiumWizard({
  wallet,
  active,
  onBuy,
}: {
  wallet: number;
  active: boolean;
  onBuy: () => void;
}) {
  const [pinKey, setPinKey] = useState(0);
  const [busy, setBusy] = useState(false);

  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Charging {kes(SMS_BUNDLE.price)}…</h3>
        <p>{SMS_BUNDLE.credits} SMS credits are added once M-Pesa confirms.</p>
      </div>
    );
  }

  if (active) {
    return (
      <div>
        <div className="gm-wx-receipt">
          <strong className="d-block font-display">Active bundle</strong>
          <p className="mb-2" style={{ fontWeight: 600 }}>
            {SMS_BUNDLE.credits} credits · valid {SMS_BUNDLE.validFor} ·
            shortcode {SMS_BUNDLE.shortcode}
          </p>
          <div className="d-flex flex-wrap gap-2">
            <span className="gm-chip">{kes(SMS_BUNDLE.perSms)} per SMS</span>
            <span className="gm-chip">Wallet {kes(wallet)}</span>
            <span className="gm-chip gm-chip-lime">Paid via M-Pesa</span>
          </div>
        </div>
        <p className="mt-3 mb-0" style={{ fontWeight: 600 }}>
          {SMS_BUNDLE.note}
        </p>
      </div>
    );
  }

  return (
    <div>
      <WxFactGrid
        facts={[
          { label: "Bundle", value: `${SMS_BUNDLE.credits} SMS` },
          { label: "Price", value: kes(SMS_BUNDLE.price) },
          { label: "Per message", value: kes(SMS_BUNDLE.perSms) },
          { label: "Valid", value: SMS_BUNDLE.validFor },
          { label: "Wallet balance", value: kes(wallet) },
        ]}
      />
      <p className="mt-3" style={{ fontWeight: 600 }}>
        {SMS_BUNDLE.note}
      </p>
      <PinPad
        resetKey={pinKey}
        actionLabel={`Enter your M-Pesa PIN to pay ${kes(SMS_BUNDLE.price)}`}
        onComplete={() => {
          setBusy(true);
          window.setTimeout(() => {
            setBusy(false);
            onBuy();
          }, 1100);
        }}
      />
      <div className="text-center mt-2">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={() => setPinKey((key) => key + 1)}
        >
          <RefreshCw /> Reset PIN entry
        </button>
      </div>
    </div>
  );
}

function AlertDetailModal({
  alert,
  onAck,
  onAction,
  onDismiss,
}: {
  alert: ExtremeAlert;
  onAck: () => void;
  onAction: (target: ModalId) => void;
  onDismiss: () => void;
}) {
  if (!alert) return null;
  const actionLabels: Record<ExtremeAlert["actionModal"], string> = {
    drainage: "Plan drainage",
    cover: "Plan protection",
    irrigation: "Plan irrigation",
    sms: "Broadcast to crew",
    shelter: "Flood response plan",
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <StatusChip
          label={alert.severity}
          tone={severityTone(alert.severity)}
        />
        <StatusChip
          label={alert.ack ? "Acknowledged" : "Open"}
          tone={alert.ack ? "low" : "high"}
        />
        <span className="gm-chip">{alert.source}</span>
      </div>
      <p className="mt-3" style={{ fontWeight: 600 }}>
        {alert.message}
      </p>
      <WxFactGrid
        facts={[
          { label: "Swahili", value: alert.swahili },
          { label: "Issued", value: alert.issued },
          { label: "Valid", value: alert.valid },
          { label: "Counties", value: alert.counties },
          { label: "Affected", value: alert.affected },
        ]}
      />
      <div className="gm-wx-pop mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={() => onAction(alert.actionModal)}
        >
          <ClipboardList /> {actionLabels[alert.actionModal]}
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => onAction("sms")}
        >
          <MessageSquare /> Warn the crew
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => onAction("share")}
        >
          <Share2 /> Share briefing
        </button>
      </div>
      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          onClick={onDismiss}
        >
          <X /> Dismiss
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={alert.ack}
          onClick={onAck}
        >
          <Check /> {alert.ack ? "Acknowledged" : "Acknowledge"}
        </button>
      </WxModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS · season, scenario, engine
   ========================================================================== */

function MonthDetailModal({
  month,
  onAdvisory,
  onExport,
}: {
  month: (typeof SEASONAL_OUTLOOK)[number];
  onAdvisory: (target: ModalId) => void;
  onExport: () => void;
}) {
  const related = SEASONAL_ADVISORY.filter((row) =>
    row.window.toLowerCase().includes(month.month.split(" ")[0].toLowerCase()),
  );
  const list = related.length ? related : SEASONAL_ADVISORY.slice(0, 3);

  return (
    <div>
      <WxFactGrid
        facts={[
          { label: "Rainfall", value: month.rainfall },
          { label: "vs average", value: month.vsAverage },
          { label: "Temperature", value: month.temp },
          { label: "Rainy days", value: month.rainyDays },
          { label: "Onset", value: month.onset },
          { label: "Cessation", value: month.cessation },
          { label: "Dry spell", value: month.drySpell },
          { label: "Flood risk", value: month.flood },
        ]}
      />
      <div className="mt-3">
        <WxDekadalGrid month={month} />
      </div>
      <div
        className={`gm-wx-note ${month.tone === "high" ? "danger" : "warn"} mt-3`}
      >
        {month.headline}
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Risk</th>
              <th>Level</th>
              <th>Advisory</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.risk}</strong>
                </td>
                <td>
                  <StatusChip label={row.level} tone={row.level} />
                </td>
                <td>{row.advisory}</td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={() => onAdvisory(row.actionModal)}
                  >
                    {row.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onExport}
        >
          <Download /> Export outlook
        </button>
      </WxModalFooter>
    </div>
  );
}

function ScenarioModal({
  scenario,
  onPlan,
  onClose,
  onRerun,
}: {
  scenario: (typeof WEATHER_SCENARIOS)[number];
  onPlan: () => void;
  onClose: () => void;
  onRerun: () => void;
}) {
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setRunning(true);
    const timer = window.setTimeout(() => setRunning(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (running) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Running the ensemble…</h3>
        <p>Blending Copernicus C3S, KMD seasonal and NASA POWER for Kiambu.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <StatusChip
          label={`${scenario.probability}% likely`}
          tone={scenario.tone}
        />
        <span className="gm-chip">{scenario.driver}</span>
      </div>
      <WxFactGrid
        facts={[
          { label: "Onset", value: scenario.onset },
          { label: "Season rainfall", value: scenario.rainfall },
          { label: "Yield impact", value: scenario.yieldImpact },
        ]}
      />
      <div
        className={`gm-wx-note ${scenario.tone === "high" ? "danger" : "warn"} mt-3`}
      >
        {scenario.advisory}
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Budget line</th>
              <th>Baseline</th>
              <th>This scenario</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fungicide</td>
              <td className="font-display">{kes(2900)}</td>
              <td className="font-display">
                {kes(scenario.tone === "high" ? 5200 : 2900)}
              </td>
              <td>
                <StatusChip
                  label={scenario.tone === "high" ? "+79%" : "No change"}
                  tone={scenario.tone}
                />
              </td>
            </tr>
            <tr>
              <td>Irrigation</td>
              <td className="font-display">{kes(3600)}</td>
              <td className="font-display">
                {kes(scenario.id === "sc-nina" ? 9800 : 3600)}
              </td>
              <td>
                <StatusChip
                  label={scenario.id === "sc-nina" ? "+172%" : "No change"}
                  tone={scenario.id === "sc-nina" ? "high" : "neutral"}
                />
              </td>
            </tr>
            <tr>
              <td>Expected cabbage yield</td>
              <td className="font-display">10.2 t</td>
              <td className="font-display">
                {scenario.tone === "high" ? "7.8 t" : "10.0 t"}
              </td>
              <td>
                <StatusChip
                  label={scenario.tone === "high" ? "−24%" : "−2%"}
                  tone={scenario.tone}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onRerun}
        >
          <RefreshCw /> Re-run
        </button>
        <button type="button" className="gm-btn gm-btn-soft" onClick={onClose}>
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onPlan}>
          <Droplets /> Adjust irrigation plan
        </button>
      </WxModalFooter>
    </div>
  );
}

function PeriodDetailModal({
  plan,
  period,
  synced,
  onSync,
  onIrrigate,
  onSpray,
}: {
  plan: CropWeatherPlan;
  period: CropPeriod;
  synced: boolean;
  onSync: () => void;
  onIrrigate: () => void;
  onSpray: () => void;
}) {
  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className="gm-mega-icon" aria-hidden="true">
          {plan.symbol}
        </span>
        <div style={{ flex: 1 }}>
          <strong className="font-display d-block">
            {plan.crop} · {period.stage}
          </strong>
          <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>
            {period.period} · days {period.days} · {plan.plot}
          </small>
        </div>
        <StatusChip label={period.match} tone={period.tone} />
      </div>
      <WxFactGrid
        facts={[
          { label: "Predicted rain", value: period.rain },
          { label: "Predicted temp", value: period.temp },
          { label: "Crop need", value: period.need },
          {
            label: "Water balance",
            value: `${period.waterBalance > 0 ? "+" : ""}${period.waterBalance} mm`,
          },
        ]}
      />
      <WxBalanceBar value={period.waterBalance} />
      <div
        className={`gm-wx-note ${period.tone === "high" ? "danger" : "warn"} mt-3`}
      >
        {period.advisory}
      </div>
      <div className="gm-check-row mt-3">
        <span className="gm-mega-icon">
          <Sparkles />
        </span>
        <span style={{ flex: 1 }}>
          <small>Season context</small>
          <strong>
            {plan.totalRain} mm predicted vs {plan.totalNeed} mm needed · match{" "}
            {plan.matchScore}/100
          </strong>
        </span>
      </div>
      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onSpray}
        >
          <FlaskConical /> Plan a spray
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={onIrrigate}
        >
          <Droplets /> Plan irrigation
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={synced}
          onClick={onSync}
        >
          <ClipboardList /> {synced ? "Pushed" : "Push to crop plan"}
        </button>
      </WxModalFooter>
    </div>
  );
}

const GENERIC_STAGES = [
  "Establishment",
  "Vegetative growth",
  "Flowering",
  "Grain / fruit fill",
  "Maturity & harvest",
];

function buildPlan(
  option: (typeof ENGINE_CROP_LIBRARY)[number],
  county: string,
  plot: string,
  acres: number,
  planted: string,
): CropWeatherPlan {
  const weights = [0.12, 0.28, 0.22, 0.24, 0.14];
  const seasonRain = 340;
  const needPerStage = [0.1, 0.25, 0.25, 0.28, 0.12];
  let dayCursor = 0;
  const periods: CropPeriod[] = GENERIC_STAGES.map((stage, index) => {
    const days = Math.max(
      7,
      Math.round((option.duration / 5) * (index === 4 ? 1.2 : 1)),
    );
    const start = dayCursor + 1;
    const end = Math.min(option.duration, dayCursor + days);
    dayCursor += days;
    const rain = Math.round(seasonRain * weights[index]);
    const need = Math.round(
      option.waterNeed.includes("Low")
        ? 180
        : option.waterNeed.includes("Very high")
          ? 520
          : 300,
    );
    const needMm = Math.round(need * needPerStage[index]);
    const balance = rain - needMm;
    return {
      id: `${option.id}-${index}`,
      period: `Stage ${index + 1} · days ${start}–${end}`,
      days: `${start}–${end}`,
      stage,
      rain: `${Math.round(rain * 0.8)}–${Math.round(rain * 1.2)} mm`,
      rainMid: rain,
      temp: "16–27°C",
      need:
        balance < -10
          ? "More water than the forecast delivers"
          : "Forecast covers this stage",
      match:
        balance < -15
          ? "Low"
          : balance < 0
            ? "Decreasing"
            : balance > 25
              ? "Surplus"
              : "Good",
      tone: balance < -15 ? "high" : balance < 0 ? "medium" : "low",
      advisory:
        balance < -15
          ? "Budget an irrigation round here — the forecast will not cover the crop."
          : balance < 0
            ? "Watch soil moisture; top up if the rain misses."
            : "Rain covers this stage. Focus on nutrition and scouting.",
      waterBalance: balance,
    };
  });
  const totalRain = periods.reduce((sum, row) => sum + row.rainMid, 0);
  const totalNeed = Math.round(
    (option.waterNeed.includes("Low")
      ? 180
      : option.waterNeed.includes("Very high")
        ? 520
        : 300) * 1,
  );
  const score = Math.max(
    55,
    Math.min(
      96,
      Math.round((totalRain / totalNeed) * 100) -
        Math.abs(totalRain - totalNeed) / 6,
    ),
  );

  return {
    id: `cw-${option.id}`,
    crop: option.crop,
    swahili: option.swahili,
    variety: option.variety,
    county,
    plot,
    acres,
    planted,
    duration: `${option.duration} days`,
    totalRain,
    totalNeed,
    matchScore: score,
    verdict: `${option.crop} modelled for ${option.duration} days in ${county}. Rain covers about ${Math.round((totalRain / totalNeed) * 100)}% of the water need.`,
    symbol: option.symbol,
    periods,
  };
}

function EngineAddWizard({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (plan: CropWeatherPlan) => void;
}) {
  const [step, setStep] = useState(0);
  const [optionId, setOptionId] = useState(ENGINE_CROP_LIBRARY[0].id);
  const [county, setCounty] = useState("Kiambu");
  const [plot, setPlot] = useState("Plot 3: Lower shamba");
  const [acres, setAcres] = useState("0.75");
  const [planted, setPlanted] = useState("10 Dec 2026");
  const [busy, setBusy] = useState(false);

  const option =
    ENGINE_CROP_LIBRARY.find((row) => row.id === optionId) ??
    ENGINE_CROP_LIBRARY[0];
  const counties = [
    "Kiambu",
    "Nakuru",
    "Meru",
    "Kakamega",
    "Uasin Gishu",
    "Kisumu",
    "Machakos",
    "Kilifi",
    "Nyandarua",
    "Makueni",
  ];
  const duplicate = existing.includes(option.crop);

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onAdd(buildPlan(option, county, plot, Number(acres) || 0.5, planted));
    }, 1200);
  };

  return (
    <div>
      <Stepper
        steps={["Crop", "Details", "Generate"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="mt-3">
          {ENGINE_CROP_LIBRARY.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`gm-checkcard ${row.id === optionId ? "on" : ""}`}
              onClick={() => setOptionId(row.id)}
            >
              <span aria-hidden="true" style={{ fontSize: "1.4rem" }}>
                {row.symbol}
              </span>
              <span style={{ flex: 1 }}>
                <strong>
                  {row.crop} — {row.variety}
                </strong>
                <small>
                  {row.swahili} · {row.duration} days · {row.waterNeed} ·{" "}
                  {row.county}
                </small>
              </span>
              {existing.includes(row.crop) ? (
                <StatusChip label="Already modelled" tone="neutral" />
              ) : null}
            </button>
          ))}
          {duplicate ? (
            <div className="gm-wx-note warn mt-2">
              {option.crop} is already modelled — adding it again creates a
              second plan for a different plot.
            </div>
          ) : null}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <WxField label="County">
            <select
              className="gm-select"
              value={county}
              onChange={(event) => setCounty(event.target.value)}
            >
              {counties.map((row) => (
                <option key={row}>{row}</option>
              ))}
            </select>
          </WxField>
          <WxField label="Plot">
            <input
              className="gm-input"
              value={plot}
              onChange={(event) => setPlot(event.target.value)}
            />
          </WxField>
          <WxField label="Area (acres)">
            <input
              className="gm-input"
              inputMode="decimal"
              value={acres}
              onChange={(event) =>
                setAcres(event.target.value.replace(/[^\d.]/g, "").slice(0, 5))
              }
            />
          </WxField>
          <WxField label="Planted / planting date">
            <input
              className="gm-input"
              value={planted}
              onChange={(event) => setPlanted(event.target.value)}
            />
          </WxField>
        </div>
      ) : null}
      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Modelling {option.crop}…</h3>
            <p>
              Running {option.duration} days of forecast against{" "}
              {option.waterNeed.toLowerCase()} water needs.
            </p>
          </div>
        ) : (
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Crop</td>
                  <td>
                    <strong>
                      {option.crop} — {option.variety}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>
                    {county} · {plot} · {acres} acre
                  </td>
                </tr>
                <tr>
                  <td>Cycle</td>
                  <td>
                    {option.duration} days from {planted}
                  </td>
                </tr>
                <tr>
                  <td>Stages modelled</td>
                  <td>{GENERIC_STAGES.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          finishLabel="Generate prediction"
          nextDisabled={step === 1 ? !plot.trim() || Number(acres) <= 0 : false}
        />
      ) : null}
    </div>
  );
}

function EngineSyncWizard({
  plan,
  synced,
  onSync,
}: {
  plan: CropWeatherPlan;
  synced: string[];
  onSync: (ids: string[]) => void;
}) {
  const risky = plan.periods.filter((row) => row.tone !== "low");
  const [chosen, setChosen] = useState<string[]>(
    risky.filter((row) => !synced.includes(row.id)).map((row) => row.id),
  );
  const [busy, setBusy] = useState(false);

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSync(chosen);
    }, 1000);
  };

  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Writing tasks…</h3>
        <p>Dating each advisory against the {plan.crop} calendar.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontWeight: 600 }}>
        {plan.crop} — {plan.variety}, {plan.plot}. Tick the stages that should
        become dated tasks on the crop page.
      </p>
      {plan.periods.map((row) => (
        <button
          key={row.id}
          type="button"
          className={`gm-checkcard ${chosen.includes(row.id) ? "on" : ""}`}
          onClick={() =>
            setChosen((current) =>
              current.includes(row.id)
                ? current.filter((id) => id !== row.id)
                : [...current, row.id],
            )
          }
        >
          <input
            type="checkbox"
            readOnly
            checked={chosen.includes(row.id)}
            tabIndex={-1}
          />
          <span style={{ flex: 1 }}>
            <strong>
              {row.stage} · {row.period}
            </strong>
            <small>
              {row.rain} · {row.advisory}
            </small>
          </span>
          {synced.includes(row.id) ? (
            <StatusChip label="Pushed" tone="low" />
          ) : (
            <StatusChip label={row.match} tone={row.tone} />
          )}
        </button>
      ))}
      <WxModalFooter>
        <span
          className="me-auto align-self-center"
          style={{
            fontWeight: 700,
            fontSize: ".8rem",
            color: "var(--gm-ink-400)",
          }}
        >
          {chosen.length} stage{chosen.length === 1 ? "" : "s"} selected
        </span>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={chosen.length === 0}
          onClick={finish}
        >
          <ClipboardList /> Push {chosen.length} task
          {chosen.length === 1 ? "" : "s"}
        </button>
      </WxModalFooter>
    </div>
  );
}

/* ==========================================================================
   MODALS · planting plan, exports, gauge log, stations, share, calculator
   ========================================================================== */

function PlantingPlanWizard({
  windowRow,
  onSave,
  onPlanner,
}: {
  windowRow: PlantingWindow;
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
  onPlanner: () => void;
}) {
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState<"best" | "good">("best");
  const [plot, setPlot] = useState("Plot 3: Lower shamba");
  const [acres, setAcres] = useState("0.75");
  const [lines, setLines] = useState<Record<string, number>>({
    "pi-01": 1,
    "pi-03": 1,
    "pi-04": 1,
    "pi-07": 2,
    "pi-08": 4,
  });
  const [when, setWhen] = useState(windowRow.best.split(" – ")[0] ?? "Oct 1");
  const [busy, setBusy] = useState(false);

  const area = Number(acres) || 0;
  const items = PLAN_INPUTS.filter((row) => (lines[row.id] ?? 0) > 0);
  const total = items.reduce(
    (sum, row) => sum + row.price * (lines[row.id] ?? 0),
    0,
  );
  const perAcre = area ? Math.round(total / area) : 0;

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Plant ${windowRow.crop} (${windowRow.variety}) — ${slot === "best" ? "best" : "good"} window`,
        detail: `${windowRow.county} · ${area} acre · ${items.length} input lines · ${when}`,
        due: when,
        plot,
        cost: total,
        source: "Planting window advisor",
      });
    }, 1000);
  };

  return (
    <div>
      <Stepper
        steps={["Window", "Inputs", "Schedule"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div>
          <div className="gm-wx-note mb-3">{windowRow.note}</div>
          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className={`gm-checkcard ${slot === "best" ? "on" : ""}`}
              onClick={() => {
                setSlot("best");
                setWhen(windowRow.best.split(" – ")[0] ?? windowRow.best);
              }}
            >
              <input
                type="radio"
                readOnly
                checked={slot === "best"}
                tabIndex={-1}
              />
              <span style={{ flex: 1 }}>
                <strong>Best window</strong>
                <small>{windowRow.best}</small>
              </span>
            </button>
            <button
              type="button"
              className={`gm-checkcard ${slot === "good" ? "on" : ""}`}
              onClick={() => {
                setSlot("good");
                setWhen(windowRow.good.split(" – ")[0] ?? windowRow.good);
              }}
            >
              <input
                type="radio"
                readOnly
                checked={slot === "good"}
                tabIndex={-1}
              />
              <span style={{ flex: 1 }}>
                <strong>Good window</strong>
                <small>{windowRow.good}</small>
              </span>
            </button>
          </div>
          <div className="gm-form-grid">
            <WxField label="Plot">
              <input
                className="gm-input"
                value={plot}
                onChange={(event) => setPlot(event.target.value)}
              />
            </WxField>
            <WxField label="Area (acres)">
              <input
                className="gm-input"
                inputMode="decimal"
                value={acres}
                onChange={(event) =>
                  setAcres(
                    event.target.value.replace(/[^\d.]/g, "").slice(0, 5),
                  )
                }
              />
            </WxField>
          </div>
          <WxFactGrid
            facts={[
              {
                label: "County / AEZ",
                value: `${windowRow.county} ${windowRow.aez}`,
              },
              {
                label: "Crop",
                value: `${windowRow.crop} · ${windowRow.swahili}`,
              },
              { label: "Variety", value: windowRow.variety },
              { label: "Model confidence", value: `${windowRow.confidence}%` },
            ]}
          />
        </div>
      ) : null}
      {step === 1 ? (
        <div>
          {PLAN_INPUTS.map((row) => (
            <div key={row.id} className="gm-check-row">
              <span style={{ flex: 1 }}>
                <strong>{row.item}</strong>
                <small>
                  {row.detail} · {kes(row.price)} per {row.unit}
                </small>
              </span>
              <input
                className="gm-input"
                style={{ width: 78, padding: ".4rem .6rem" }}
                inputMode="numeric"
                aria-label={`Quantity for ${row.item}`}
                value={lines[row.id] ?? 0}
                onChange={(event) =>
                  setLines((current) => ({
                    ...current,
                    [row.id]: Number(
                      event.target.value.replace(/\D/g, "").slice(0, 3),
                    ),
                  }))
                }
              />
              <span
                className="font-display"
                style={{ minWidth: 92, textAlign: "right" }}
              >
                {kes(row.price * (lines[row.id] ?? 0))}
              </span>
            </div>
          ))}
          <div className="gm-wx-receipt mt-3">
            <strong className="d-block font-display">
              {kes(total)} total · {kes(perAcre)} per acre
            </strong>
            <small style={{ fontWeight: 700 }}>
              {items.length} input lines for {area} acre of {windowRow.crop}
            </small>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Scheduling the planting…</h3>
            <p>Blocking the window and reserving inputs.</p>
          </div>
        ) : (
          <div>
            <div className="gm-form-grid mt-3">
              <WxField label="Start date" full>
                <input
                  className="gm-input"
                  value={when}
                  onChange={(event) => setWhen(event.target.value)}
                />
              </WxField>
            </div>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <tbody>
                  <tr>
                    <td>Crop</td>
                    <td>
                      <strong>
                        {windowRow.crop} — {windowRow.variety}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Window</td>
                    <td>
                      {slot === "best" ? windowRow.best : windowRow.good} (
                      {slot})
                    </td>
                  </tr>
                  <tr>
                    <td>Plot</td>
                    <td>
                      {plot} · {area} acre
                    </td>
                  </tr>
                  <tr>
                    <td>Inputs budget</td>
                    <td className="font-display">
                      <strong>{kes(total)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="gm-wx-note mt-3">
              Avoid: {windowRow.avoid}. Risky: {windowRow.risky}.
            </div>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          finishLabel="Schedule planting"
          nextDisabled={area <= 0 || total <= 0 || !when.trim()}
        />
      ) : null}
      <Link
        to="/app/planner"
        className="gm-btn gm-btn-soft gm-btn-sm gm-btn-block mt-2"
        onClick={onPlanner}
      >
        <Sprout /> Or open the full crop planner
      </Link>
    </div>
  );
}

function ExportWizard({
  onExport,
}: {
  onExport: (kind: "conditions" | "forecast" | "season" | "history") => void;
}) {
  const sections = [
    {
      id: "conditions" as const,
      label: "Live conditions",
      note: `${CURRENT_CONDITIONS.length} parameters with field actions`,
    },
    {
      id: "forecast" as const,
      label: "7-day forecast",
      note: "Min/max, rain, wind, humidity, UV, ET₀ and spray windows",
    },
    {
      id: "season" as const,
      label: "Seasonal outlook",
      note: "Three months plus the AI risk advisory",
    },
    {
      id: "history" as const,
      label: "Climate normals",
      note: "12-month averages and ten years of season outcomes",
    },
  ];
  const [chosen, setChosen] = useState<string[]>(["forecast"]);
  const [destination, setDestination] = useState("Download CSV");

  return (
    <div>
      <p style={{ fontWeight: 600 }}>
        Pick the sections. Everything is written to one CSV with your farm
        header.
      </p>
      {sections.map((row) => (
        <button
          key={row.id}
          type="button"
          className={`gm-checkcard ${chosen.includes(row.id) ? "on" : ""}`}
          onClick={() =>
            setChosen((current) =>
              current.includes(row.id)
                ? current.filter((id) => id !== row.id)
                : [...current, row.id],
            )
          }
        >
          <input
            type="checkbox"
            readOnly
            checked={chosen.includes(row.id)}
            tabIndex={-1}
          />
          <span style={{ flex: 1 }}>
            <strong>{row.label}</strong>
            <small>{row.note}</small>
          </span>
        </button>
      ))}
      <div className="gm-form-grid mt-3">
        <WxField label="Destination" full>
          <select
            className="gm-select"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            <option>Download CSV</option>
            <option>Download and attach to the farm diary</option>
            <option>Download and email the co-op secretary</option>
          </select>
        </WxField>
      </div>
      <WxModalFooter>
        <span
          className="me-auto align-self-center"
          style={{
            fontWeight: 700,
            fontSize: ".8rem",
            color: "var(--gm-ink-400)",
          }}
        >
          {chosen.length} section{chosen.length === 1 ? "" : "s"} selected
        </span>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={chosen.length === 0}
          onClick={() => {
            for (const id of chosen) {
              onExport(id as "conditions" | "forecast" | "season" | "history");
            }
          }}
        >
          <Download /> Download {chosen.length} file
          {chosen.length === 1 ? "" : "s"}
        </button>
      </WxModalFooter>
    </div>
  );
}

function CompareYearsModal({
  years,
  selectedId,
  onSelect,
  onExport,
}: {
  years: (typeof HISTORICAL_YEARS)[number][];
  selectedId: string;
  onSelect: (id: string) => void;
  onExport: () => void;
}) {
  const selected = years.find((row) => row.id === selectedId) ?? years[0];
  const average = Math.round(
    years.reduce((sum, row) => sum + row.rain, 0) / years.length,
  );
  const wettest = years.reduce((a, b) => (a.rain > b.rain ? a : b), years[0]);
  const driest = years.reduce((a, b) => (a.rain < b.rain ? a : b), years[0]);

  return (
    <div>
      <WxFactGrid
        facts={[
          { label: "Average", value: `${average} mm` },
          { label: "Wettest", value: `${wettest.year} · ${wettest.rain} mm` },
          { label: "Driest", value: `${driest.year} · ${driest.rain} mm` },
          {
            label: "Selected",
            value: `${selected.year} · ${selected.rain} mm`,
          },
        ]}
      />
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Season rain</th>
              <th>Anomaly</th>
              <th>Onset</th>
              <th>Cessation</th>
              <th>Rainy days</th>
              <th>Event</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {years.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong className="font-display">{row.year}</strong>
                </td>
                <td className="font-display">{row.rain} mm</td>
                <td>
                  <StatusChip
                    label={`${row.anomaly > 0 ? "+" : ""}${row.anomaly}%`}
                    tone={row.tone}
                  />
                </td>
                <td>{row.onset}</td>
                <td>{row.cessation}</td>
                <td className="font-display">{row.rainyDays}</td>
                <td>{row.event}</td>
                <td>
                  <button
                    type="button"
                    className={`gm-btn gm-btn-sm ${row.id === selectedId ? "gm-btn-dark" : "gm-btn-outline"}`}
                    onClick={() => onSelect(row.id)}
                  >
                    {row.id === selectedId ? "Selected" : "Select"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gm-wx-note mt-3">
        <strong>{selected.year}:</strong> {selected.event}. {selected.yieldNote}
        . Budget against the {average} mm average, not against a single year.
      </div>
      <WxModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onExport}
        >
          <Download /> Export ten years
        </button>
      </WxModalFooter>
    </div>
  );
}

function ObservationWizard({
  onSave,
}: {
  onSave: (reading: GaugeObservation) => void;
}) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("07:00");
  const [plot, setPlot] = useState(IRRIGATION_PLOTS[0].plot);
  const [gauge, setGauge] = useState("");
  const [station, setStation] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(false);
  const [busy, setBusy] = useState(false);

  const gaugeMm = Number(gauge) || 0;
  const stationMm = Number(station) || gaugeMm;

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        id: `go-${Date.now()}`,
        date: date === "Today" ? "Today" : date,
        time,
        plot,
        gaugeMm,
        stationMm,
        by: "Mary Wanjiku",
        note: note.trim() || "Routine reading",
        tone: gaugeMm >= 15 ? "high" : gaugeMm >= 5 ? "medium" : "low",
        photo,
      });
    }, 800);
  };

  return (
    <div>
      <Stepper
        steps={["Reading", "Confirm"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <WxField label="Date">
            <select
              className="gm-select"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            >
              <option>Today</option>
              <option>Yesterday</option>
            </select>
          </WxField>
          <WxField label="Time">
            <input
              className="gm-input"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </WxField>
          <WxField label="Gauge location" full>
            <select
              className="gm-select"
              value={plot}
              onChange={(event) => setPlot(event.target.value)}
            >
              {IRRIGATION_PLOTS.map((row) => (
                <option key={row.id}>{row.plot}</option>
              ))}
            </select>
          </WxField>
          <WxField label="Your gauge (mm)">
            <input
              className="gm-input"
              inputMode="decimal"
              value={gauge}
              onChange={(event) =>
                setGauge(event.target.value.replace(/[^\d.]/g, "").slice(0, 5))
              }
              placeholder="e.g. 8.4"
            />
          </WxField>
          <WxField label="KMD station (mm)">
            <input
              className="gm-input"
              inputMode="decimal"
              value={station}
              onChange={(event) =>
                setStation(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 5),
                )
              }
              placeholder="Optional"
            />
          </WxField>
          <WxField label="Note" full>
            <textarea
              className="gm-textarea"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Steady rain from 21:00, drains ran full"
            />
          </WxField>
        </div>
      ) : null}
      {step === 1 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Saving the reading…</h3>
          </div>
        ) : (
          <div>
            <WxFactGrid
              facts={[
                { label: "Date", value: `${date} ${time}` },
                { label: "Your gauge", value: `${gaugeMm} mm` },
                { label: "KMD station", value: `${stationMm} mm` },
                {
                  label: "Variance",
                  value: `${(gaugeMm - stationMm).toFixed(1)} mm`,
                },
              ]}
            />
            <div className="mt-3">
              <Toggle
                checked={photo}
                onChange={setPhoto}
                label="Attach a field photo"
                desc="Useful for insurance claims after heavy rain"
              />
            </div>
            <div className="gm-wx-note mt-3">
              Readings feed the plot-level correction that makes tomorrow's
              forecast more accurate for your farm.
            </div>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 1 ? finish() : setStep((value) => value + 1))}
          finishLabel="Save reading"
          nextDisabled={gauge === ""}
        />
      ) : null}
    </div>
  );
}

function FaultModal({
  stations,
  onSave,
}: {
  stations: WeatherStation[];
  onSave: (fault: StationFault) => void;
}) {
  const [stationId, setStationId] = useState(
    stations.find((row) => row.status !== "online")?.id ?? stations[0].id,
  );
  const [issue, setIssue] = useState("No data received");
  const [detail, setDetail] = useState("");
  const [phone, setPhone] = useState("0712 345 678");
  const [urgency, setUrgency] = useState("Normal");
  const [busy, setBusy] = useState(false);

  const station = stations.find((row) => row.id === stationId) ?? stations[0];
  const issues = [
    "No data received",
    "Rain gauge under-reading",
    "Solar panel / battery fault",
    "Anemometer reading low",
    "Telemetry SIM problem",
    "Physical damage",
  ];

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        id: `sf-${Date.now()}`,
        station: station.name,
        date: "Today",
        issue: detail.trim() ? `${issue} — ${detail.trim()}` : issue,
        status: "Open",
        tone: urgency === "Urgent" ? "high" : "medium",
        technician: "Unassigned",
        eta: urgency === "Urgent" ? "Within 48 hrs" : "Within 7 days",
      });
    }, 900);
  };

  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Reporting the fault…</h3>
        <p>A GrowMO field technician will be assigned.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="gm-form-grid">
        <WxField label="Station" full>
          <select
            className="gm-select"
            value={stationId}
            onChange={(event) => setStationId(event.target.value)}
          >
            {stations.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name} · {row.status}
              </option>
            ))}
          </select>
        </WxField>
        <WxField label="What is wrong">
          <select
            className="gm-select"
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
          >
            {issues.map((row) => (
              <option key={row}>{row}</option>
            ))}
          </select>
        </WxField>
        <WxField label="Urgency">
          <select
            className="gm-select"
            value={urgency}
            onChange={(event) => setUrgency(event.target.value)}
          >
            <option>Normal</option>
            <option>Urgent</option>
          </select>
        </WxField>
        <WxField label="Detail" full>
          <textarea
            className="gm-textarea"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="e.g. Panel covered in dust, battery flat since Tuesday"
          />
        </WxField>
        <WxField label="Contact phone">
          <input
            className="gm-input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </WxField>
      </div>
      <div className="gm-wx-note">
        {station.name} is {station.distance} km from your farm and last reported{" "}
        {station.lastPing}. Custodian: {station.custodian} · {station.phone}.
      </div>
      <WxModalFooter>
        <button type="button" className="gm-btn gm-btn-lime" onClick={finish}>
          <Wrench /> Report fault
        </button>
      </WxModalFooter>
    </div>
  );
}

function StationLogModal({
  faults,
  selected,
  onReport,
  onResolve,
}: {
  faults: StationFault[];
  selected: StationFault;
  onReport: () => void;
  onResolve: (id: string) => void;
}) {
  return (
    <div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Station</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Technician</th>
              <th>ETA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {faults.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>
                  <strong>{row.station}</strong>
                </td>
                <td>{row.issue}</td>
                <td>
                  <StatusChip label={row.status} tone={row.tone} />
                </td>
                <td>{row.technician}</td>
                <td>{row.eta}</td>
                <td>
                  {row.status === "Resolved" ? (
                    <Check width={16} height={16} />
                  ) : (
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => onResolve(row.id)}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected ? (
        <div className="gm-wx-note mt-3">
          <strong>{selected.station}</strong> — {selected.issue}. Status{" "}
          {selected.status}
          {selected.technician !== "Unassigned"
            ? `, handled by ${selected.technician}`
            : ", awaiting assignment"}
          .
        </div>
      ) : null}
      <WxModalFooter>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onReport}>
          <TriangleAlert /> Report a new fault
        </button>
      </WxModalFooter>
    </div>
  );
}

function ShareWizard({
  station,
  onSent,
}: {
  station: WeatherStation;
  onSent: (message: SentMessage) => void;
}) {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState("Field crew");
  const [channel, setChannel] = useState("WhatsApp");
  const [language, setLanguage] = useState("EN");
  const [include, setInclude] = useState<string[]>([
    "Today",
    "7-day",
    "Alerts",
  ]);
  const [busy, setBusy] = useState(false);

  const options = [
    "Today",
    "7-day",
    "Season outlook",
    "Alerts",
    "Spray windows",
  ];
  const recipients =
    audience === "Field crew"
      ? ALERT_CONTACTS.filter((row) => row.active).length
      : audience === "Co-op members"
        ? 42
        : 1;
  const preview =
    language === "SW"
      ? `Habari! Hali ya hewa ${WEATHER_PROFILE.place}: leo 24°C, mvua 70% jioni (8-15 mm). Upepo 12 km/h NE. Fanya kazi asubuhi, fungua mifereji kabla ya saa 9.`
      : `Morning. Weather for ${WEATHER_PROFILE.place}: 24°C today, 70% chance of rain from 15:00 (8–15 mm). Wind 12 km/h NE. Work in the morning and open the drains before 14:00.`;

  const send = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSent({
        id: `brief-${Date.now()}`,
        channel,
        recipients: `${recipients} people`,
        body: `${include.join(" + ")} briefing (${language})`,
        cost: channel === "WhatsApp" ? 0 : recipients * 2,
        at: "just now",
        ref: `GM${Math.floor(100000 + Math.random() * 899999)}`,
      });
    }, 1000);
  };

  return (
    <div>
      <Stepper
        steps={["Audience", "Preview"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <WxField label="Audience">
              <select
                className="gm-select"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
              >
                <option>Field crew</option>
                <option>Co-op members</option>
                <option>Just me</option>
              </select>
            </WxField>
            <WxField label="Channel">
              <select
                className="gm-select"
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
              >
                <option>WhatsApp</option>
                <option>SMS</option>
                <option>Email</option>
              </select>
            </WxField>
            <WxField label="Language">
              <select
                className="gm-select"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="EN">English</option>
                <option value="SW">Kiswahili</option>
              </select>
            </WxField>
            <WxField label="Recipients">
              <input
                className="gm-input"
                value={`${recipients} people`}
                readOnly
              />
            </WxField>
          </div>
          <p className="gm-f-label">Include</p>
          {options.map((row) => (
            <button
              key={row}
              type="button"
              className={`gm-checkcard ${include.includes(row) ? "on" : ""}`}
              onClick={() =>
                setInclude((current) =>
                  current.includes(row)
                    ? current.filter((item) => item !== row)
                    : [...current, row],
                )
              }
            >
              <input
                type="checkbox"
                readOnly
                checked={include.includes(row)}
                tabIndex={-1}
              />
              <span style={{ flex: 1 }}>
                <strong>{row}</strong>
                <small>
                  {row === "Today"
                    ? "Current conditions and the day's spray window"
                    : row === "7-day"
                      ? "The full field forecast table"
                      : row === "Season outlook"
                        ? "Three-month outlook and risks"
                        : row === "Alerts"
                          ? "Open extreme weather alerts"
                          : "Next safe spray windows"}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Sending the briefing…</h3>
          </div>
        ) : (
          <div>
            <div className="gm-wx-receipt">
              <strong className="d-block font-display">
                {channel} · {audience} ·{" "}
                {language === "SW" ? "Kiswahili" : "English"}
              </strong>
              <p className="mb-2" style={{ fontWeight: 600 }}>
                {preview}
              </p>
              <div className="d-flex flex-wrap gap-2">
                {include.map((row) => (
                  <span key={row} className="gm-chip">
                    {row}
                  </span>
                ))}
                <span className="gm-chip gm-chip-gold">
                  {channel === "WhatsApp" ? "Free" : kes(recipients * 2)}
                </span>
              </div>
            </div>
            <div className="gm-wx-note mt-3">
              Source: {station.name} · {station.distance} km ·{" "}
              {station.lastPing}.
            </div>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 1 ? send() : setStep((value) => value + 1))}
          finishLabel={`Send via ${channel}`}
          nextDisabled={include.length === 0}
        />
      ) : null}
    </div>
  );
}

function Et0Modal() {
  const [acres, setAcres] = useState("0.5");
  const [kc, setKc] = useState("1.0");
  const [et0, setEt0] = useState("3.5");
  const [rain, setRain] = useState("12");
  const [days, setDays] = useState("7");

  const area = Number(acres) || 0;
  const coefficient = Number(kc) || 1;
  const reference = Number(et0) || 0;
  const expectedRain = Number(rain) || 0;
  const span = Number(days) || 1;
  const need = Math.max(0, reference * coefficient * span - expectedRain);
  const volume = Math.round(need * area * 4.05);
  const cost = Math.round((volume / 5000) * 2500);
  const perDay = (need / span).toFixed(1);

  return (
    <div>
      <div className="gm-form-grid">
        <WxField label="Area (acres)">
          <input
            className="gm-input"
            inputMode="decimal"
            value={acres}
            onChange={(event) =>
              setAcres(event.target.value.replace(/[^\d.]/g, "").slice(0, 5))
            }
          />
        </WxField>
        <WxField label="Crop coefficient (Kc)">
          <select
            className="gm-select"
            value={kc}
            onChange={(event) => setKc(event.target.value)}
          >
            <option value="0.7">0.7 — establishment</option>
            <option value="1">1.0 — vegetative</option>
            <option value="1.05">1.05 — heading / flowering</option>
            <option value="0.8">0.8 — maturity</option>
          </select>
        </WxField>
        <WxField label="Reference ET₀ (mm/day)">
          <input
            className="gm-input"
            inputMode="decimal"
            value={et0}
            onChange={(event) =>
              setEt0(event.target.value.replace(/[^\d.]/g, "").slice(0, 4))
            }
          />
        </WxField>
        <WxField label="Expected rain over the period (mm)">
          <input
            className="gm-input"
            inputMode="decimal"
            value={rain}
            onChange={(event) =>
              setRain(event.target.value.replace(/[^\d.]/g, "").slice(0, 4))
            }
          />
        </WxField>
        <WxField label="Days">
          <select
            className="gm-select"
            value={days}
            onChange={(event) => setDays(event.target.value)}
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
          </select>
        </WxField>
      </div>
      <WxFactGrid
        facts={[
          { label: "Deficit to cover", value: `${need.toFixed(1)} mm` },
          { label: "Per day", value: `${perDay} mm` },
          { label: "Water volume", value: `${volume} m³` },
          { label: "Bowser cost", value: kes(cost) },
        ]}
      />
      <div className="gm-wx-note mt-3">
        1 mm of water on 1 acre is about 4.05 m³. A 5,000 L bowser costs roughly{" "}
        {kes(2500)} delivered in Githunguri, so plan rounds rather than daily
        trips.
      </div>
    </div>
  );
}

function ScoutWizard({
  onSave,
}: {
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [plots, setPlots] = useState<string[]>([
    "Plot 1: Shamba ya nyumba",
    "Plot 3: Lower shamba",
  ]);
  const [targets, setTargets] = useState<string[]>([
    "Diamondback moth larvae",
    "Black rot leaf margins",
  ]);
  const [frequency, setFrequency] = useState("Twice weekly");
  const [start, setStart] = useState("Monday 07:00");
  const [busy, setBusy] = useState(false);

  const targetOptions = [
    "Diamondback moth larvae",
    "Black rot leaf margins",
    "Aphid colonies on new growth",
    "Cutworm cutting at the collar",
    "Downy mildew on lower leaves",
    "Fall armyworm whorl damage",
  ];
  const pestChoices = [
    { id: "trap", label: "Pheromone traps", cost: 1600 },
    { id: "bt", label: "Bt (Dipel DF) on hand", cost: 2400 },
    { id: "emamectin", label: "Emamectin benzoate", cost: 1900 },
  ];
  const [kit, setKit] = useState<string[]>(["trap"]);
  const cost = pestChoices
    .filter((row) => kit.includes(row.id))
    .reduce((sum, row) => sum + row.cost, 0);

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Scout ${plots.length} plot${plots.length === 1 ? "" : "s"} — ${targets.length} targets`,
        detail: `${frequency} · ${targets.join(", ")} · kit ${kit.join(", ")}`,
        due: start,
        plot: plots.join(" + "),
        cost,
        source: "Seasonal advisory",
      });
    }, 800);
  };

  return (
    <div>
      <Stepper
        steps={["Where & what", "Kit & schedule"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div>
          <p className="gm-f-label mt-3">Plots to walk</p>
          {IRRIGATION_PLOTS.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`gm-checkcard ${plots.includes(row.plot) ? "on" : ""}`}
              onClick={() =>
                setPlots((current) =>
                  current.includes(row.plot)
                    ? current.filter((item) => item !== row.plot)
                    : [...current, row.plot],
                )
              }
            >
              <input
                type="checkbox"
                readOnly
                checked={plots.includes(row.plot)}
                tabIndex={-1}
              />
              <span style={{ flex: 1 }}>
                <strong>{row.plot}</strong>
                <small>
                  {row.crop} · {row.acres} acre · soil moisture {row.moisture}%
                </small>
              </span>
            </button>
          ))}
          <p className="gm-f-label mt-3">What to look for</p>
          {targetOptions.map((row) => (
            <button
              key={row}
              type="button"
              className={`gm-checkcard ${targets.includes(row) ? "on" : ""}`}
              onClick={() =>
                setTargets((current) =>
                  current.includes(row)
                    ? current.filter((item) => item !== row)
                    : [...current, row],
                )
              }
            >
              <input
                type="checkbox"
                readOnly
                checked={targets.includes(row)}
                tabIndex={-1}
              />
              <span style={{ flex: 1 }}>
                <strong>{row}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Scheduling the round…</h3>
          </div>
        ) : (
          <div>
            <p className="gm-f-label mt-3">Scouting kit</p>
            {pestChoices.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`gm-checkcard ${kit.includes(row.id) ? "on" : ""}`}
                onClick={() =>
                  setKit((current) =>
                    current.includes(row.id)
                      ? current.filter((id) => id !== row.id)
                      : [...current, row.id],
                  )
                }
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={kit.includes(row.id)}
                  tabIndex={-1}
                />
                <span style={{ flex: 1 }}>
                  <strong>{row.label}</strong>
                  <small>{kes(row.cost)}</small>
                </span>
              </button>
            ))}
            <div className="gm-form-grid mt-3">
              <WxField label="Frequency">
                <select
                  className="gm-select"
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                >
                  <option>Once weekly</option>
                  <option>Twice weekly</option>
                  <option>Every three days</option>
                </select>
              </WxField>
              <WxField label="First round">
                <input
                  className="gm-input"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </WxField>
            </div>
            <div className="gm-wx-note">
              Scout in the morning while the canopy is still damp — larvae hide
              under leaves once it warms up. Kit cost {kes(cost)}.
            </div>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 1 ? finish() : setStep((value) => value + 1))}
          finishLabel="Schedule scouting"
          nextDisabled={plots.length === 0 || targets.length === 0}
        />
      ) : null}
    </div>
  );
}

function HarvestPlanWizard({
  onSave,
}: {
  onSave: (task: Omit<WeatherTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage Gloria F1 — Plot 1");
  const [start, setStart] = useState("12 Jan 2027");
  const [crew, setCrew] = useState("6");
  const [buyer, setBuyer] = useState("Twiga Foods (Nairobi)");
  const [grade, setGrade] = useState("Grade 1 — firm heads, 1.2–1.8 kg");
  const [busy, setBusy] = useState(false);

  const heads = 4200;
  const price = 32;
  const revenue = heads * price;
  const cost = Number(crew) * 800 * 3;

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Harvest ${crop.split(" — ")[0]} — dry window`,
        detail: `${heads.toLocaleString("en-KE")} heads · ${buyer} · crew of ${crew} · 3 days from ${start}`,
        due: start,
        plot: crop.split(" — ")[1] ?? "Plot 1",
        cost,
        source: "Seasonal advisory · harvest rain risk low",
      });
    }, 900);
  };

  return (
    <div>
      <Stepper
        steps={["Crop & buyer", "Crew & dates"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <WxField label="Crop" full>
            <select
              className="gm-select"
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
            >
              {IRRIGATION_PLOTS.map((row) => (
                <option key={row.id}>{`${row.crop} — ${row.plot}`}</option>
              ))}
            </select>
          </WxField>
          <WxField label="Buyer">
            <select
              className="gm-select"
              value={buyer}
              onChange={(event) => setBuyer(event.target.value)}
            >
              <option>Twiga Foods (Nairobi)</option>
              <option>Githunguri market (direct)</option>
              <option>Githunguri FCS aggregation</option>
              <option>Kalimoni Greens (export)</option>
            </select>
          </WxField>
          <WxField label="Grade target">
            <select
              className="gm-select"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            >
              <option>Grade 1 — firm heads, 1.2–1.8 kg</option>
              <option>Grade 2 — 0.8–1.2 kg</option>
              <option>Mixed — local market</option>
            </select>
          </WxField>
        </div>
      ) : null}
      {step === 1 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Drafting the harvest plan…</h3>
          </div>
        ) : (
          <div>
            <div className="gm-form-grid mt-3">
              <WxField label="Start date">
                <input
                  className="gm-input"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </WxField>
              <WxField label="Crew">
                <input
                  className="gm-input"
                  inputMode="numeric"
                  value={crew}
                  onChange={(event) =>
                    setCrew(event.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                />
              </WxField>
            </div>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <tbody>
                  <tr>
                    <td>Expected heads</td>
                    <td className="font-display">
                      {heads.toLocaleString("en-KE")}
                    </td>
                  </tr>
                  <tr>
                    <td>Farm-gate price</td>
                    <td className="font-display">{kes(price)} / head</td>
                  </tr>
                  <tr>
                    <td>Gross revenue</td>
                    <td className="font-display">{kes(revenue)}</td>
                  </tr>
                  <tr>
                    <td>Harvest labour (3 days)</td>
                    <td className="font-display">{kes(cost)}</td>
                  </tr>
                  <tr>
                    <td>Weather risk at harvest</td>
                    <td>
                      <StatusChip label="Low — dry January" tone="low" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="gm-wx-note mt-3">
              Cut in the morning, grade under shade and move within 24 hours —
              January rain is only 5–10 mm, so there is no wash-out risk.
            </div>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 1 ? finish() : setStep((value) => value + 1))}
          finishLabel="Save harvest plan"
          nextDisabled={Number(crew) <= 0 || !start.trim()}
        />
      ) : null}
    </div>
  );
}
