/* ============================================================================
   PAGE 13 — COMMUNITY, LEARNING & BENCHMARKING  (/app/community)

   Blueprint sections implemented:
   13.1 Discussion forums          13.2 Extension library
   13.3 Agronomist connect         13.4 Farmer groups
   13.5 Success stories            13.6 Peer benchmarking & leaderboard

   Every control does something: threads and replies are posted into local
   state, resources are downloaded or queued for offline delivery, agronomist
   sessions move through an M-Pesa style flow, farmer groups are joined for
   real (with a receipt), and benchmark gaps become season-plan actions.
   ========================================================================== */
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Download,
  Eye,
  Handshake,
  HelpCircle,
  Inbox,
  Layers,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  Printer,
  Search,
  Settings2,
  Share2,
  Star,
  ThumbsUp,
  TrendingUp,
  Truck,
  Users,
  WifiOff,
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
import { Dialog } from "../../components/auth/controls";
import {
  AgronomistCard,
  BadgeTile,
  BenchmarkBar,
  ChatThread,
  CommunityHero,
  CommunityKv,
  EventRow,
  ForumCategoryCard,
  GroupCard,
  LeaderboardRow,
  ResourceCard,
  ServiceRow,
  StoryCard,
  ThreadRow,
  type ChatMessage,
  type CommunityKpi,
} from "../../components/app/CommunityWidgets";
import {
  AgronomistProfileDialog,
  AgronomistRequestWizard,
  AskExpertDialog,
  BenchmarkCompareDialog,
  BookmarkDialog,
  CategoryThreadsDialog,
  CommunitySettingsDialog,
  ContributionDialog,
  EventRegisterDialog,
  ExpertContactDialog,
  GroupBuyingWizard,
  InviteFarmerDialog,
  JoinGroupWizard,
  LeaveGroupDialog,
  NewThreadWizard,
  RateSessionDialog,
  ReportContentDialog,
  ResourcePreviewDialog,
  ResourceRequestDialog,
  SessionDetailDialog,
  ShareStoryDialog,
  StoryDetailDialog,
  ThreadDetailDialog,
} from "../../components/app/CommunityModals";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AGRONOMIST_SERVICES,
  AGRONOMISTS,
  AGRO_SESSIONS,
  BENCHMARK_METRICS,
  COMMUNITY_BADGES,
  COMMUNITY_CHAT_SEED,
  COMMUNITY_CONTEXT,
  COMMUNITY_FAQ,
  COMMUNITY_SETTINGS,
  EXPERT_CHAT_SEED,
  FARMER_GROUPS,
  FORUM_CATEGORIES,
  FORUM_THREADS,
  GROUP_ACTIVITY_LOG,
  GROUP_CONTRIBUTIONS,
  GROUP_EVENTS,
  GROUP_ORDER_ITEMS,
  LEADERBOARD,
  LIBRARY_CATEGORIES,
  LIBRARY_RESOURCES,
  PEER_GROUPS,
  SUCCESS_STORIES,
} from "../../data/app/community";
import type {
  Agronomist,
  AgroSession,
  BenchmarkMetric,
  FarmerGroup,
  ForumCategory,
  ForumThread,
  GroupContribution,
  GroupEvent,
  GroupOrderItem,
  LibraryResource,
  SuccessStory,
} from "../../data/app/community";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

type CommunityView =
  | "forums"
  | "library"
  | "experts"
  | "groups"
  | "stories"
  | "benchmarks";

type ModalId =
  | "thread-new"
  | "thread-detail"
  | "report-thread"
  | "category"
  | "faq"
  | "resource"
  | "resource-offline"
  | "bookmark"
  | "expert-request"
  | "expert-profile"
  | "session-detail"
  | "rate-session"
  | "expert-contact"
  | "ask-expert"
  | "expert-chat"
  | "join-group"
  | "leave-group"
  | "group-order"
  | "contribution"
  | "event"
  | "story"
  | "share-story"
  | "benchmark"
  | "invite"
  | "settings"
  | null;

type DrawerId = "group" | "activity" | null;

type LocalOrder = {
  id: string;
  item: string;
  quantity: number;
  total: number;
  receipt: string;
  delivery: string;
  date: string;
};

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export const Route = createFileRoute("/app/community")({
  component: CommunityPage,
});

/* ================================ 13.1 ================================== */

function ForumsSection({
  threads,
  onNewThread,
  onOpenThread,
  onReport,
  onOpenCategory,
  onOpenFaq,
  onCategories,
}: {
  threads: ForumThread[];
  onNewThread: (category?: string) => void;
  onOpenThread: (thread: ForumThread) => void;
  onReport: (thread: ForumThread) => void;
  onOpenCategory: (category: ForumCategory) => void;
  onOpenFaq: () => void;
  onCategories: () => void;
}) {
  const [tab, setTab] = useState<"threads" | "categories" | "faq">("threads");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Most recent");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = threads.filter((thread) => {
      const matches =
        needle.length === 0 ||
        thread.title.toLowerCase().includes(needle) ||
        thread.body.toLowerCase().includes(needle) ||
        thread.category.toLowerCase().includes(needle) ||
        thread.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
        thread.author.toLowerCase().includes(needle);
      const state =
        filter === "All" ||
        (filter === "Open" && !thread.solved) ||
        (filter === "Solved" && thread.solved) ||
        (filter === "Pinned" && thread.pinned) ||
        (filter === "Kiswahili" && thread.language === "SW");
      return matches && state;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "Most replies") return b.replies.length - a.replies.length;
      if (sort === "Most likes") return b.likes - a.likes;
      if (sort === "Most viewed") return b.views - a.views;
      return a.id < b.id ? 1 : -1;
    });
  }, [threads, query, filter, sort]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="13.1 · Discussion forums"
        title="Ask, answer, and build the county's knowledge"
        subtitle="Ten categories moderated by verified agronomists. Every answer is tied to real Kenyan conditions, prices and products."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onOpenFaq}>
              <HelpCircle /> Community rules & FAQ
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onNewThread()}>
              <Plus /> Start a thread
            </button>
          </div>
        }
      />

      <div className="gm-card p-2 my-3">
        <PlannerSubtabs
          label="Forum views"
          value={tab}
          onChange={setTab}
          items={[
            { id: "threads", label: "Threads", icon: <MessageCircle />, count: threads.length },
            { id: "categories", label: "Categories", icon: <LayoutGrid />, count: FORUM_CATEGORIES.length },
            { id: "faq", label: "FAQ", icon: <HelpCircle />, count: COMMUNITY_FAQ.length },
          ]}
        />
      </div>

      {tab === "threads" ? (
        <>
          <div className="gm-cm-toolbar">
            <div className="gm-cm-search">
              <Search />
              <input
                className="gm-input"
                value={query}
                placeholder="Search threads, crops, tags or farmers"
                aria-label="Search threads"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            {["All", "Open", "Solved", "Pinned", "Kiswahili"].map((item) => (
              <button
                type="button"
                key={item}
                className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
                onClick={() => {
                  setFilter(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
            <select
              className="gm-select"
              value={sort}
              aria-label="Sort threads"
              onChange={(event) => setSort(event.target.value)}
            >
              {["Most recent", "Most replies", "Most likes", "Most viewed"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="gm-cm-count">
              {matched.length} of {threads.length} threads
            </span>
          </div>

          <div className="gm-card p-3">
            {shown.length === 0 ? (
              <div className="gm-empty">
                <span className="gm-service-icon">
                  <MessageCircle />
                </span>
                <h3 className="font-display">No thread matches that search</h3>
                <p className="text-muted">
                  Try a crop name, a county or a symptom. If nothing comes up, ask
                  the question yourself — new threads get answered within a day.
                </p>
                <button type="button" className="gm-btn gm-btn-lime" onClick={() => onNewThread()}>
                  <Plus /> Ask the community
                </button>
              </div>
            ) : (
              shown.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} onOpen={() => onOpenThread(thread)} />
              ))
            )}
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>

          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Moderation"
              title="How this forum stays trustworthy"
              subtitle="Advice that touches pesticide safety is checked by a verified agronomist before it is marked as solved."
              action={
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onReport(threads[0])}>
                  <AlertTriangle /> Report content
                </button>
              }
            />
            <div className="gm-cm-feature-grid">
              <div className="gm-cm-feature">
                <BadgeCheck />
                <span>
                  <strong>Verified answers</strong>
                  <small>Green badges on replies from registered agronomists and extension officers.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <ShieldCheckIcon />
                <span>
                  <strong>PCPB-checked products</strong>
                  <small>Product names must be registered for the crop in Kenya.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <ClipboardCheck />
                <span>
                  <strong>Evidence-linked</strong>
                  <small>Advice links to KALRO guides and to the spray records in your farm diary.</small>
                </span>
              </div>
            </div>
          </div>
        </>
      ) : tab === "categories" ? (
        <>
          <div className="gm-cm-toolbar">
            <span className="gm-cm-count">
              Six main categories plus four special interests ·{" "}
              {FORUM_CATEGORIES.reduce((total, item) => total + item.members, 0).toLocaleString("en-KE")}{" "}
              member subscriptions
            </span>
            <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onCategories}>
              <LayoutGrid /> Category guide
            </button>
          </div>
          <div className="gm-cm-kpi-grid" style={{ marginTop: 0 }}>
            {FORUM_CATEGORIES.map((category) => (
              <ForumCategoryCard
                key={category.id}
                category={category}
                onOpen={() => onOpenCategory(category)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="13.1 · Community rules"
            title="Frequently asked community questions"
            subtitle="Open any question — the answers also cover how GrowMO keeps advice safe and how groups see your data."
            action={
              <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onOpenFaq}>
                <HelpCircle /> Open the full FAQ
              </button>
            }
          />
          <div className="gm-cm-feature-grid">
            {COMMUNITY_FAQ.slice(0, 3).map((item) => (
              <div className="gm-cm-feature" key={item.q}>
                <HelpCircle />
                <span>
                  <strong>{item.q}</strong>
                  <small>{item.a.slice(0, 96)}…</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* Small inline icon wrapper so the moderation card reuses a real lucide icon. */
function ShieldCheckIcon() {
  return <CheckCircle2 />;
}

/* ================================ 13.2 ================================== */

function LibrarySection({
  resources,
  saved,
  onOpen,
  onBookmark,
  onOffline,
}: {
  resources: LibraryResource[];
  saved: string[];
  onOpen: (resource: LibraryResource) => void;
  onBookmark: (resource: LibraryResource) => void;
  onOffline: (resource: LibraryResource) => void;
}) {
  const [tab, setTab] = useState<"browse" | "saved" | "categories">("browse");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [format, setFormat] = useState("All formats");
  const [language, setLanguage] = useState("All languages");
  const [sort, setSort] = useState("Most downloaded");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const formats = ["All formats", ...Array.from(new Set(resources.map((item) => item.format)))];
  const languages = ["All languages", "EN", "SW", "EN/SW"];

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = resources.filter((item) => {
      const matches =
        needle.length === 0 ||
        item.title.toLowerCase().includes(needle) ||
        item.swahiliTitle.toLowerCase().includes(needle) ||
        item.source.toLowerCase().includes(needle) ||
        item.summary.toLowerCase().includes(needle) ||
        item.smsCode.toLowerCase().includes(needle);
      const savedFilter = tab !== "saved" || saved.includes(item.id);
      return (
        matches &&
        savedFilter &&
        (category === "All categories" || item.category === category) &&
        (format === "All formats" || item.format === format) &&
        (language === "All languages" || item.language === language)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sort === "Newest") return b.year - a.year;
      if (sort === "Highest rated") return b.rating - a.rating;
      if (sort === "Shortest first") return a.length.localeCompare(b.length);
      return b.downloads - a.downloads;
    });
  }, [resources, query, category, format, language, sort, tab, saved]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="13.2 · Extension library"
        title="KALRO, ministry and PCPB material in your pocket"
        subtitle="Crop guides, video tutorials, pest ID cards and certification manuals — searchable, and downloadable as light offline versions by SMS code."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setTab("saved")}>
              <Bookmark /> My saved ({saved.length})
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-soft gm-btn-sm"
              onClick={() => {
                downloadText(
                  "growmo-extension-library.csv",
                  [
                    ["Resource", "Category", "Format", "Language", "Source", "SMS code"],
                    ...resources.map((item) => [
                      item.title,
                      item.category,
                      item.format,
                      item.language,
                      item.source,
                      item.smsCode,
                    ]),
                  ]
                    .map((row) => row.map(csvCell).join(","))
                    .join("\n"),
                );
              }}
            >
              <Download /> Download catalogue
            </button>
          </div>
        }
      />

      <div className="gm-card p-2 my-3">
        <PlannerSubtabs
          label="Library views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "browse", label: "Browse resources", icon: <BookOpen />, count: resources.length },
            { id: "saved", label: "Saved", icon: <Bookmark />, count: saved.length },
            { id: "categories", label: "Categories", icon: <Layers />, count: LIBRARY_CATEGORIES.length },
          ]}
        />
      </div>

      {tab === "categories" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Collection overview"
            title="Ten content categories"
            subtitle="Every category carries the issuing source so you can cite it in a certification audit."
            action={
              <span className="gm-chip gm-chip-ghost">
                <WifiOff /> Offline versions available for all
              </span>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Format</th>
                  <th>Language</th>
                  <th>Items</th>
                  <th>Source</th>
                  <th>Offline</th>
                </tr>
              </thead>
              <tbody>
                {LIBRARY_CATEGORIES.map((item) => (
                  <tr key={item.category}>
                    <td>
                      <strong>{item.category}</strong>
                    </td>
                    <td>{item.format}</td>
                    <td>
                      <StatusChip label={item.language} tone="neutral" />
                    </td>
                    <td className="font-display">{item.count}</td>
                    <td>{item.source}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-table-link"
                        onClick={() => {
                          setTab("browse");
                          setCategory(item.category);
                          setPage(1);
                        }}
                      >
                        Browse {item.count} items
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="gm-cm-toolbar">
            <div className="gm-cm-search">
              <Search />
              <input
                className="gm-input"
                value={query}
                placeholder="Search titles, Kiswahili names, sources or SMS codes"
                aria-label="Search resources"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="gm-select"
              value={category}
              aria-label="Filter by category"
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              {["All categories", ...LIBRARY_CATEGORIES.map((item) => item.category)].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              className="gm-select"
              value={format}
              aria-label="Filter by format"
              onChange={(event) => {
                setFormat(event.target.value);
                setPage(1);
              }}
            >
              {formats.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              className="gm-select"
              value={language}
              aria-label="Filter by language"
              onChange={(event) => {
                setLanguage(event.target.value);
                setPage(1);
              }}
            >
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              className="gm-select"
              value={sort}
              aria-label="Sort resources"
              onChange={(event) => setSort(event.target.value)}
            >
              {["Most downloaded", "Highest rated", "Newest", "Shortest first"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="gm-cm-count">{matched.length} resources</span>
          </div>

          {shown.length === 0 ? (
            <div className="gm-card p-3">
              <div className="gm-empty">
                <span className="gm-service-icon">
                  <BookOpen />
                </span>
                <h3 className="font-display">
                  {tab === "saved" ? "Nothing saved yet" : "No resource matches those filters"}
                </h3>
                <p className="text-muted">
                  {tab === "saved"
                    ? "Open any resource and choose Save — you can file it into a folder such as Season LR 2026."
                    : "Widen the filters, or request a resource that is missing and the extension desk will look for it."}
                </p>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => {
                    setTab("browse");
                    setQuery("");
                    setCategory("All categories");
                    setFormat("All formats");
                    setLanguage("All languages");
                  }}
                >
                  <BookOpen /> Browse the whole library
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="gm-cm-kpi-grid" style={{ marginTop: 0 }}>
                {shown.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onPreview={() => onOpen(resource)}
                    onBookmark={() => onBookmark(resource)}
                  />
                ))}
              </div>
              <div className="gm-card p-2 mt-3">
                <Pagination
                  page={current}
                  total={pages}
                  onChange={setPage}
                  perPage={perPage}
                  totalItems={matched.length}
                />
              </div>
            </>
          )}

          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="No data, no problem"
              title="Offline and feature-phone access"
              subtitle="Every resource has an SMS code and a light version, because extension material is useless if it cannot be opened in a field."
            />
            <div className="gm-cm-feature-grid">
              {resources.slice(0, 3).map((item) => (
                <div className="gm-cm-feature" key={item.id}>
                  <Phone />
                  <span>
                    <strong>
                      SMS {item.smsCode} to 40401
                    </strong>
                    <small>{item.title}</small>
                    <button
                      type="button"
                      className="gm-table-link mt-2"
                      onClick={() => onOffline(item)}
                    >
                      Request the offline bundle
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Reveal>
  );
}

/* ================================ 13.3 ================================== */

function ExpertsSection({
  experts,
  sessions,
  onProfile,
  onRequest,
  onRate,
  onRepeat,
  onContact,
  onChat,
  onAskExpert,
}: {
  experts: Agronomist[];
  sessions: AgroSession[];
  onProfile: (expert: Agronomist) => void;
  onRequest: (expert?: Agronomist, serviceId?: string) => void;
  onRate: (session: AgroSession) => void;
  onRepeat: (session: AgroSession) => void;
  onContact: (expert: Agronomist) => void;
  onChat: (expert: Agronomist) => void;
  onAskExpert: () => void;
}) {
  const [tab, setTab] = useState<"find" | "sessions" | "services">("find");
  const [query, setQuery] = useState("");
  const [speciality, setSpeciality] = useState("All specialities");
  const [county, setCounty] = useState("All counties");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return experts.filter((item) => {
      const matches =
        needle.length === 0 ||
        item.name.toLowerCase().includes(needle) ||
        item.speciality.toLowerCase().includes(needle) ||
        item.counties.toLowerCase().includes(needle) ||
        item.languages.toLowerCase().includes(needle);
      const specialityMatch =
        speciality === "All specialities" ||
        item.speciality.toLowerCase().includes(speciality.toLowerCase());
      const countyMatch =
        county === "All counties" || item.counties.toLowerCase().includes(county.toLowerCase());
      return matches && specialityMatch && countyMatch;
    });
  }, [experts, query, speciality, county]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);
  const rated = sessions.filter((session) => session.rating > 0);
  const averageRating =
    rated.length > 0
      ? (rated.reduce((total, session) => total + session.rating, 0) / rated.length).toFixed(1)
      : "—";
  const freeUsed = sessions.filter((session) => session.cost === 0).length;

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="13.3 · Agronomist connect"
        title="Talk to somebody who has walked your plot"
        subtitle="Verified agronomists, extension officers and certified crop advisers — chat, photo diagnosis, voice calls and field visits."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onAskExpert}>
              <BadgeCheck /> Ask the expert forum
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onRequest()}>
              <Plus /> Request a session
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={MessageCircle}
          label="Free sessions left"
          value={`${COMMUNITY_CONTEXT.expertCredits} chat · ${COMMUNITY_CONTEXT.photoCredits} photo`}
          note={`${freeUsed} free sessions used so far`}
        />
        <DashboardMetric
          icon={Star}
          label="Your average rating given"
          value={averageRating}
          note={`${rated.length} of ${sessions.length} sessions rated`}
        />
        <DashboardMetric
          icon={BadgeCheck}
          label="Verified agronomists"
          value={String(experts.filter((item) => item.verified).length)}
          note={`${experts.length} professionals listed in the directory`}
        />
        <DashboardMetric
          icon={Users}
          label="Paid sessions"
          value={String(sessions.filter((session) => session.cost > 0).length)}
          note="Chat from KES 50, voice calls KES 100"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Agronomist views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "find", label: "Find an agronomist", icon: <BadgeCheck />, count: experts.length },
            { id: "services", label: "Services & pricing", icon: <Coins />, count: AGRONOMIST_SERVICES.length },
            { id: "sessions", label: "My sessions", icon: <ClipboardCheck />, count: sessions.length },
          ]}
        />
      </div>

      {tab === "services" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Costed options"
            title="Five ways to get help, with the price up front"
            subtitle="Free monthly allowances come with every farm account. Nothing is charged without the M-Pesa confirmation."
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Free allowance</th>
                  <th>Cost after allowance</th>
                  <th>Typical turnaround</th>
                  <th>Used by you</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {AGRONOMIST_SERVICES.map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    used={
                      service.id === "svc-1"
                        ? `${freeUsed} of 2 free this month`
                        : service.id === "svc-2"
                          ? `${COMMUNITY_CONTEXT.photoCredits} of 3 free left`
                          : sessions.filter((session) => session.topic === service.label).length >
                              0
                            ? `${sessions.filter((session) => session.topic === service.label).length} booked`
                            : "Not used yet"
                    }
                    onBook={() => onRequest(undefined, service.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "sessions" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="History"
            title="Your agronomist sessions"
            subtitle="Ratings you give keep the directory honest — low rated sessions are reviewed by the county extension desk."
            action={
              <span className="gm-chip gm-chip-ghost">
                <ClipboardCheck /> {sessions.length} sessions on record
              </span>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Agronomist</th>
                  <th>Topic & outcome</th>
                  <th>Channel</th>
                  <th>Cost</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.date}</td>
                    <td>
                      <strong>{session.agronomist}</strong>
                      <small className="d-block text-muted">{session.duration}</small>
                    </td>
                    <td>
                      {session.topic}
                      <small className="d-block text-muted">{session.outcome}</small>
                    </td>
                    <td>{session.channel}</td>
                    <td className="font-display">
                      {session.cost === 0 ? "Free" : `KES ${session.cost}`}
                    </td>
                    <td>
                      {session.rating > 0 ? (
                        <span className="gm-chip gm-chip-lime">★ {session.rating}</span>
                      ) : (
                        <StatusChip label="Not rated" tone="neutral" />
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onRate(session)}
                        >
                          Rate
                        </button>
                        <button
                          type="button"
                          className="gm-btn gm-btn-outline gm-btn-sm"
                          onClick={() => onRepeat(session)}
                        >
                          Follow-up
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="gm-cm-toolbar">
            <div className="gm-cm-search">
              <Search />
              <input
                className="gm-input"
                value={query}
                placeholder="Search by name, speciality, county or language"
                aria-label="Search agronomists"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="gm-select"
              value={speciality}
              aria-label="Filter by speciality"
              onChange={(event) => {
                setSpeciality(event.target.value);
                setPage(1);
              }}
            >
              {[
                "All specialities",
                "horticulture",
                "cereal",
                "potato",
                "livestock",
                "soil",
                "certification",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              className="gm-select"
              value={county}
              aria-label="Filter by county"
              onChange={(event) => {
                setCounty(event.target.value);
                setPage(1);
              }}
            >
              {["All counties", "Kiambu", "Nairobi", "Nakuru", "Uasin Gishu", "Machakos", "Nyandarua", "Kisumu"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
            <span className="gm-cm-count">{matched.length} of {experts.length} shown</span>
          </div>
          <div className="gm-cm-kpi-grid" style={{ marginTop: 0 }}>
            {shown.map((expert) => (
              <AgronomistCard
                key={expert.id}
                agronomist={expert}
                onProfile={() => onProfile(expert)}
                onRequest={() => onRequest(expert)}
              />
            ))}
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Keep talking"
              title="Direct lines once you have paid for support"
              subtitle="A paid chat stays open for the whole season. You can also reach the agronomist by SMS or ask for a call-back."
            />
            <div className="gm-cm-feature-grid">
              <div className="gm-cm-feature">
                <Phone />
                <span>
                  <strong>Voice call · KES 100 / 15 min</strong>
                  <small>The agronomist calls your M-Pesa number at the booked slot.</small>
                </span>
                <button
                  type="button"
                  className="gm-table-link"
                  onClick={() => onRequest(undefined, "svc-3")}
                >
                  Book
                </button>
              </div>
              <div className="gm-cm-feature">
                <Truck />
                <span>
                  <strong>Field visit · KES 500 – 2,000</strong>
                  <small>Priced by distance from Githunguri; travel shown before you pay.</small>
                </span>
                <button
                  type="button"
                  className="gm-table-link"
                  onClick={() => onRequest(undefined, "svc-4")}
                >
                  Book
                </button>
              </div>
              <div className="gm-cm-feature">
                <TrendingUp />
                <span>
                  <strong>Season-long · KES 5,000 – 15,000</strong>
                  <small>A dedicated agronomist for every decision from nursery to grading.</small>
                </span>
                <button
                  type="button"
                  className="gm-table-link"
                  onClick={() => onRequest(undefined, "svc-5")}
                >
                  Book
                </button>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onContact(experts[0])}
              >
                <Phone /> Contact details
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onChat(experts[0])}
              >
                <MessageCircle /> Open the chat with {experts[0].name}
              </button>
            </div>
          </div>
        </>
      )}
    </Reveal>
  );
}

/* ================================ 13.4 ================================== */

function GroupsSection({
  groups,
  events,
  orderItems,
  contributions,
  orders,
  messages,
  onSendChat,
  onOpenWorkspace,
  onJoin,
  onLeave,
  onOrder,
  onContribution,
  onEvent,
}: {
  groups: FarmerGroup[];
  events: GroupEvent[];
  orderItems: GroupOrderItem[];
  contributions: GroupContribution[];
  orders: LocalOrder[];
  messages: ChatMessage[];
  onSendChat: (body: string) => void;
  onOpenWorkspace: (group: FarmerGroup) => void;
  onJoin: (group: FarmerGroup) => void;
  onLeave: (group: FarmerGroup) => void;
  onOrder: (item?: GroupOrderItem) => void;
  onContribution: (contribution: GroupContribution) => void;
  onEvent: (event: GroupEvent) => void;
}) {
  const [tab, setTab] = useState<"groups" | "marketplace" | "events" | "finance">("groups");
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("All counties");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const joined = groups.filter((group) => group.joined);
  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups.filter(
      (group) =>
        (needle.length === 0 ||
          group.name.toLowerCase().includes(needle) ||
          group.focus.toLowerCase().includes(needle) ||
          group.activities.join(" ").toLowerCase().includes(needle)) &&
        (county === "All counties" || group.county === county),
    );
  }, [groups, query, county]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  const paid = contributions.filter((item) => item.status === "Paid");
  const pending = contributions.filter((item) => item.status !== "Paid");

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="13.4 · Farmer groups"
        title="Stronger together — buying, selling and learning as a group"
        subtitle={`You belong to ${joined.length} groups, saving ${COMMUNITY_CONTEXT.savingsThisSeason.toLocaleString("en-KE")} KES this season through bulk inputs and shared transport.`}
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setTab("marketplace")}>
              <Package /> Group buying
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOrder()}>
              <Plus /> Place a bulk order
            </button>
          </div>
        }
      />

      <div className="gm-card p-2 my-3">
        <PlannerSubtabs
          label="Group views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "groups", label: "My groups & directory", icon: <Handshake />, count: groups.length },
            { id: "marketplace", label: "Group buying", icon: <Package />, count: orderItems.length },
            { id: "events", label: "Training calendar", icon: <CalendarDays />, count: events.length },
            { id: "finance", label: "Group financials", icon: <Coins />, count: contributions.length },
          ]}
        />
      </div>

      {tab === "groups" ? (
        <>
          <div className="gm-cm-toolbar">
            <div className="gm-cm-search">
              <Search />
              <input
                className="gm-input"
                value={query}
                placeholder="Search groups by name, county or activity"
                aria-label="Search groups"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="gm-select"
              value={county}
              aria-label="Filter groups by county"
              onChange={(event) => {
                setCounty(event.target.value);
                setPage(1);
              }}
            >
              {["All counties", ...Array.from(new Set(groups.map((group) => group.county)))].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="gm-cm-count">
              {joined.length} joined · {groups.length - joined.length} open to join
            </span>
          </div>
          <div className="gm-cm-kpi-grid" style={{ marginTop: 0 }}>
            {shown.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onOpen={() => onOpenWorkspace(group)}
                onJoin={() => onJoin(group)}
                onLeave={() => onLeave(group)}
              />
            ))}
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>

          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="What membership unlocks"
              title="Six features shared by every group you join"
              subtitle="The group workspace is where these live — open any group above to use them."
            />
            <div className="gm-cm-feature-grid">
              <div className="gm-cm-feature">
                <MessageCircle />
                <span>
                  <strong>Shared group chat</strong>
                  <small>Announcements, market prices and lift-sharing, in English or Kiswahili.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <Package />
                <span>
                  <strong>Group buying</strong>
                  <small>Inputs at 8 – 15% below retail, with one delivery to a collection point.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <TrendingUp />
                <span>
                  <strong>Collective marketing</strong>
                  <small>Aggregate crates, agree one price with a buyer, settle members by M-Pesa.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <Coins />
                <span>
                  <strong>Group financials</strong>
                  <small>Contributions, levies, loan fund and transparent ledgers for every member.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <CalendarDays />
                <span>
                  <strong>Training calendar</strong>
                  <small>Field days, KALRO sessions and certification clinics with seat limits.</small>
                </span>
              </div>
              <div className="gm-cm-feature">
                <BarChart3 />
                <span>
                  <strong>Internal benchmarking</strong>
                  <small>See how your yield, cost and grade share compare with the members around you.</small>
                </span>
              </div>
            </div>
          </div>
        </>
      ) : tab === "marketplace" ? (
        <>
          <DashboardSectionHeader
            eyebrow="Group buying"
            title="Bulk input orders open to your groups"
            subtitle="Prices are the negotiated group price; the retail column shows what you would pay at the agro-vet."
            action={
              <span className="gm-chip gm-chip-ghost">
                <Package /> {orders.length} orders placed this season
              </span>
            }
          />
          <div className="gm-card p-3 mt-2">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Supplier</th>
                    <th>Group price</th>
                    <th>Retail price</th>
                    <th>You save</th>
                    <th>Minimum</th>
                    <th>Order closes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.item}</strong>
                        <small className="d-block text-muted">{item.category}</small>
                      </td>
                      <td>{item.supplier}</td>
                      <td className="font-display">{kes(item.groupPrice)} / {item.unit}</td>
                      <td className="text-muted">{kes(item.retailPrice)}</td>
                      <td>
                        <span className="gm-chip gm-chip-lime">
                          {kes(item.retailPrice - item.groupPrice)}
                        </span>
                      </td>
                      <td>{item.minimum}</td>
                      <td>{item.closes}</td>
                      <td>
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onOrder(item)}
                        >
                          Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Your orders"
              title="Orders you have placed with the group"
              subtitle="Each order is added to your input purchase records once the group closes the round."
            />
            {orders.length === 0 ? (
              <div className="gm-empty">
                <span className="gm-service-icon">
                  <Package />
                </span>
                <h3 className="font-display">No order placed yet</h3>
                <p className="text-muted">
                  Pick an item above. Pay your share by M-Pesa, pay on delivery, or
                  take the group input loan and repay after harvest.
                </p>
                <button type="button" className="gm-btn gm-btn-lime" onClick={() => onOrder()}>
                  <Plus /> Place your first order
                </button>
              </div>
            ) : (
              <div className="gm-table-wrap">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Collection point</th>
                      <th>Reference</th>
                      <th>Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.item}</strong>
                        </td>
                        <td>{order.quantity}</td>
                        <td className="font-display">{kes(order.total)}</td>
                        <td>{order.delivery}</td>
                        <td>
                          <span className="gm-chip gm-chip-ghost">{order.receipt}</span>
                        </td>
                        <td>{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Group chat"
              title={joined[0]?.name ?? groups[0].name}
              subtitle="Announcements from your group committee. Replies go to every member."
            />
            <ChatThread
              messages={messages}
              placeholder="Andika ujumbe kwa kikundi…"
              note="Group chat messages are visible to all members of the group. Prices shared here are not verified by GrowMO."
              onSend={onSendChat}
            />
          </div>
        </>
      ) : tab === "events" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Training calendar"
            title="Field days, trainings and market visits"
            subtitle="Register early — field days at Githunguri hall fill up. Cancelling releases your seat to the waiting list."
            action={
              <span className="gm-chip gm-chip-ghost">
                <CalendarDays /> {events.filter((event) => event.registered).length} registered
              </span>
            }
          />
          {events.map((event) => (
            <EventRow key={event.id} event={event} onRegister={() => onEvent(event)} />
          ))}
        </div>
      ) : (
        <>
          <div className="gm-stat-grid mb-3">
            <DashboardMetric
              icon={Coins}
              label="Paid to groups"
              value={kes(paid.reduce((total, item) => total + item.amount, 0))}
              note={`${paid.length} contributions settled with receipts`}
            />
            <DashboardMetric
              icon={ClipboardCheck}
              label="Outstanding"
              value={kes(pending.reduce((total, item) => total + item.amount, 0))}
              note={`${pending.length} pending or overdue · pay any of them below`}
            />
            <DashboardMetric
              icon={TrendingUp}
              label="Marketing levy"
              value={kes(6960)}
              note="2% on the May collective cabbage sale"
            />
            <DashboardMetric
              icon={Users}
              label="Loan fund"
              value={kes(480000)}
              note="Group input loan fund raised in September"
            />
          </div>
          <div className="gm-card p-3">
            <DashboardSectionHeader
              eyebrow="Group financials"
              title="Your contributions, levies and loans"
              subtitle="Every payment produces an M-Pesa receipt that also lands in the group ledger."
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Due date</th>
                    <th>Status</th>
                    <th>Receipt</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.group}</td>
                      <td>{item.purpose}</td>
                      <td className="font-display">
                        {item.amount === 0 ? "Free" : kes(item.amount)}
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <StatusChip
                          label={item.status}
                          tone={
                            item.status === "Paid"
                              ? "low"
                              : item.status === "Pending"
                                ? "medium"
                                : "high"
                          }
                        />
                      </td>
                      <td>{item.receipt === "—" ? "—" : <span className="gm-chip gm-chip-ghost">{item.receipt}</span>}</td>
                      <td>
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onContribution(item)}
                        >
                          {item.status === "Paid" ? "View" : "Pay"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Reveal>
  );
}

/* ================================ 13.5 ================================== */

function StoriesSection({
  stories,
  followed,
  onOpen,
  onShare,
  onFollow,
}: {
  stories: SuccessStory[];
  followed: string[];
  onOpen: (story: SuccessStory) => void;
  onShare: (story: SuccessStory) => void;
  onFollow: (story: SuccessStory) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All stories");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stories.filter((story) => {
      const matches =
        needle.length === 0 ||
        story.farmer.toLowerCase().includes(needle) ||
        story.county.toLowerCase().includes(needle) ||
        story.crop.toLowerCase().includes(needle) ||
        story.achievement.toLowerCase().includes(needle);
      const state =
        filter === "All stories" ||
        (filter === "Verified only" && story.verified) ||
        (filter === "Following" && followed.includes(story.id));
      return matches && state;
    });
  }, [stories, query, filter, followed]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="13.5 · Success stories"
        title="Farmers who kept better records and earned more"
        subtitle="Real Kenyan farms, verified against their GrowMO records — before and after, in their own words."
        action={
          <span className="gm-chip gm-chip-ghost">
            <Award /> {stories.filter((story) => story.verified).length} verified stories
          </span>
        }
      />

      <div className="gm-cm-toolbar mt-3">
        <div className="gm-cm-search">
          <Search />
          <input
            className="gm-input"
            value={query}
            placeholder="Search by farmer, county, crop or achievement"
            aria-label="Search stories"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        {["All stories", "Verified only", "Following"].map((item) => (
          <button
            type="button"
            key={item}
            className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
            onClick={() => {
              setFilter(item);
              setPage(1);
            }}
          >
            {item}
          </button>
        ))}
        <span className="gm-cm-count">{matched.length} stories</span>
      </div>

      {shown.length === 0 ? (
        <div className="gm-card p-3">
          <div className="gm-empty">
            <span className="gm-service-icon">
              <Award />
            </span>
            <h3 className="font-display">No story matches that</h3>
            <p className="text-muted">
              Clear the search, or check back after the next season — stories are
              published once the harvest records are verified.
            </p>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setQuery("");
                setFilter("All stories");
              }}
            >
              <Award /> Show every story
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="gm-cm-kpi-grid" style={{ marginTop: 0 }}>
            {shown.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onOpen={() => onOpen(story)}
              />
            ))}
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>
        </>
      )}

      <div className="gm-card p-3 mt-3">
        <DashboardSectionHeader
          eyebrow="Your turn"
          title="Share what worked on your farm this season"
          subtitle="Farmers whose story is verified receive 200 contribution points and a free season-long agronomist review."
        />
        <div className="gm-cm-feature-grid">
          <div className="gm-cm-feature">
            <ClipboardCheck />
            <span>
              <strong>Records make a story credible</strong>
              <small>Before-and-after numbers are pulled from your farm diary and harvest batches.</small>
            </span>
            <button
              type="button"
              className="gm-table-link"
              onClick={() => onOpen(stories[0])}
            >
              See an example
            </button>
          </div>
          <div className="gm-cm-feature">
            <Share2 />
            <span>
              <strong>Share a story you liked</strong>
              <small>Sends the before-and-after card to WhatsApp, SMS or a group thread.</small>
            </span>
            <button
              type="button"
              className="gm-table-link"
              onClick={() => onShare(stories[1] ?? stories[0])}
            >
              Share a story
            </button>
          </div>
          <div className="gm-cm-feature">
            <Users />
            <span>
              <strong>Follow the farmers you trust</strong>
              <small>You get their new posts and season results first.</small>
            </span>
            <button
              type="button"
              className="gm-table-link"
              onClick={() => onFollow(stories[2] ?? stories[0])}
            >
              Follow {stories[2]?.farmer ?? stories[0].farmer}
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ================================ 13.6 ================================== */

function BenchmarksSection({
  metrics,
  plans,
  onCompare,
  onInvite,
}: {
  metrics: BenchmarkMetric[];
  plans: { metric: string; plan: string }[];
  onCompare: (metric: BenchmarkMetric) => void;
  onInvite: () => void;
}) {
  const [tab, setTab] = useState<"metrics" | "peers" | "leaderboard" | "badges">("metrics");
  const [filter, setFilter] = useState("All metrics");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const filtered = useMemo(() => {
    if (filter === "Ahead of county") {
      return metrics.filter((metric) =>
        metric.higherIsBetter ? metric.mine >= metric.countyAvg : metric.mine <= metric.countyAvg,
      );
    }
    if (filter === "Behind county") {
      return metrics.filter((metric) =>
        metric.higherIsBetter ? metric.mine < metric.countyAvg : metric.mine > metric.countyAvg,
      );
    }
    if (filter === "Yield & income") {
      return metrics.filter((metric) => metric.unit.includes("heads") || metric.unit === "KES");
    }
    return metrics;
  }, [metrics, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * perPage, current * perPage);
  const ahead = metrics.filter((metric) =>
    metric.higherIsBetter ? metric.mine >= metric.countyAvg : metric.mine <= metric.countyAvg,
  ).length;

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="13.6 · Learning through comparison"
        title="How does your farm compare with the neighbours?"
        subtitle="Benchmarks use only farms with complete records in the same county and acreage bracket, so the comparison is honest."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onInvite}>
              <Users /> Invite a farmer
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-soft gm-btn-sm"
              onClick={() => setTab("leaderboard")}
            >
              <Award /> Community leaderboard
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={TrendingUp}
          label="Metrics ahead of county"
          value={`${ahead} of ${metrics.length}`}
          note="Cabbage yield, grade share and net margin lead the county average"
        />
        <DashboardMetric
          icon={BarChart3}
          label="Gap to top 25%"
          value="5,000 heads / acre"
          note="Closing it is worth about KES 96,000 on 0.5 acre"
        />
        <DashboardMetric
          icon={Award}
          label="Contribution points"
          value={COMMUNITY_CONTEXT.points.toLocaleString("en-KE")}
          note={`Rank #${COMMUNITY_CONTEXT.rank} · ${COMMUNITY_CONTEXT.helpfulVotes} helpful votes received`}
        />
        <DashboardMetric
          icon={ClipboardCheck}
          label="Actions added to season plan"
          value={String(plans.length)}
          note="Each compared metric can become a plan action"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Benchmark views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "metrics", label: "My metrics", icon: <BarChart3 />, count: metrics.length },
            { id: "peers", label: "Peer groups", icon: <Users />, count: PEER_GROUPS.length },
            { id: "leaderboard", label: "Leaderboard", icon: <Award />, count: LEADERBOARD.length },
            { id: "badges", label: "Badges", icon: <BadgeCheck />, count: COMMUNITY_BADGES.length },
          ]}
        />
      </div>

      {tab === "metrics" ? (
        <>
          <div className="gm-cm-toolbar">
            {["All metrics", "Ahead of county", "Behind county", "Yield & income"].map((item) => (
              <button
                type="button"
                key={item}
                className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
                onClick={() => {
                  setFilter(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
            <span className="gm-cm-count">
              {filtered.length} of {metrics.length} metrics · {plans.length} plan actions added
            </span>
          </div>
          <div className="d-flex flex-column gap-3">
            {shown.map((metric) => (
              <BenchmarkBar key={metric.id} metric={metric} onCompare={() => onCompare(metric)} />
            ))}
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={filtered.length}
            />
          </div>
          {plans.length > 0 ? (
            <div className="gm-card p-3 mt-3">
              <DashboardSectionHeader
                eyebrow="Season plan"
                title="Actions you have taken from these comparisons"
                subtitle="These appear in the planner so you can tick them off during the season."
              />
              <div className="gm-cm-feature-grid">
                {plans.map((plan) => (
                  <div className="gm-cm-feature" key={plan.metric}>
                    <CheckCircle2 />
                    <span>
                      <strong>{plan.metric}</strong>
                      <small>{plan.plan}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : tab === "peers" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Comparison groups"
            title="Who you are being compared with"
            subtitle="You choose the peer group. Only farms with complete records are included in an average."
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Peer group</th>
                  <th>Members</th>
                  <th>Farm matches used</th>
                  <th>How the comparison works</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {PEER_GROUPS.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <strong>{group.name}</strong>
                    </td>
                    <td className="font-display">{group.members.toLocaleString("en-KE")}</td>
                    <td>
                      <StatusChip
                        label={`${group.matches} comparable farms`}
                        tone={group.matches >= 4 ? "low" : "medium"}
                      />
                    </td>
                    <td>{group.note}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-table-link"
                        onClick={() => onCompare(metrics[0])}
                      >
                        Compare against this group
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "leaderboard" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Leaderboard"
            title="September 2026 · national contribution ranking"
            subtitle="Points come from answered questions, verified stories, group mentoring and complete records."
            action={
              <span className="gm-chip gm-chip-lime">
                <Award /> Your rank #{COMMUNITY_CONTEXT.rank}
              </span>
            }
          />
          {LEADERBOARD.map((row) => (
            <LeaderboardRow key={row.id} row={row} mine={row.farmer === COMMUNITY_CONTEXT.handle} />
          ))}
          <div className="gm-cm-feature-grid mt-3">
            <div className="gm-cm-feature">
              <MessageCircle />
              <span>
                <strong>Answer a question · 20 points</strong>
                <small>Answers marked helpful by the asker count double.</small>
              </span>
              <button type="button" className="gm-table-link" onClick={onInvite}>
                Invite a farmer
              </button>
            </div>
            <div className="gm-cm-feature">
              <Award />
              <span>
                <strong>Verified success story · 200 points</strong>
                <small>Requires records that match the numbers in the story.</small>
              </span>
              <button type="button" className="gm-table-link" onClick={() => setTab("badges")}>
                See my badges
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Recognition"
            title="Badges and what they mean"
            subtitle="Badges are earned, never bought. Certification badges come from the records page after an audit."
          />
          <div className="gm-cm-feature-grid">
            {COMMUNITY_BADGES.map((badge) => (
              <BadgeTile key={badge.id} badge={badge} />
            ))}
          </div>
          <div className="mt-3">
            <span className="gm-eyebrow">Progress to the next badge</span>
            <div className="gm-card p-3 mt-2">
              <strong>Certified Farm — awarded when a certification passes</strong>
              <small className="d-block text-muted mb-2">
                Your KS1758 application is at 70% with 4 of 11 checklist items still open.
              </small>
              <ProgressLine value={70} label="Certification readiness" />
              <Link to="/app/records" className="gm-table-link d-inline-block mt-2">
                Finish the checklist on the records page <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* ================================ PAGE ================================== */

function CommunityPage() {
  const toast = useToast();
  const [view, setView] = useState<CommunityView>("forums");
  const [modal, setModal] = useState<ModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [menu, setMenu] = useState(false);

  const [threads, setThreads] = useState<ForumThread[]>(FORUM_THREADS);
  const [resources, setResources] = useState<LibraryResource[]>(LIBRARY_RESOURCES);
  const [saved, setSaved] = useState<string[]>([]);
  const [experts] = useState<Agronomist[]>(AGRONOMISTS);
  const [sessions, setSessions] = useState<AgroSession[]>(AGRO_SESSIONS);
  const [groups, setGroups] = useState<FarmerGroup[]>(FARMER_GROUPS);
  const [events, setEvents] = useState<GroupEvent[]>(GROUP_EVENTS);
  const [contributions, setContributions] = useState<GroupContribution[]>(GROUP_CONTRIBUTIONS);
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [stories] = useState<SuccessStory[]>(SUCCESS_STORIES);
  const [followed, setFollowed] = useState<string[]>([]);
  const [plans, setPlans] = useState<{ metric: string; plan: string }[]>([]);
  const [settings, setSettings] = useState(COMMUNITY_SETTINGS);
  const [groupChat, setGroupChat] = useState<ChatMessage[]>(COMMUNITY_CHAT_SEED);
  const [expertChat, setExpertChat] = useState<ChatMessage[]>(EXPERT_CHAT_SEED);
  const [reports, setReports] = useState<string[]>([]);

  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  const [activeReport, setActiveReport] = useState<ForumThread | null>(null);
  const [activeCategory, setActiveCategory] = useState<ForumCategory | null>(null);
  const [activeResource, setActiveResource] = useState<LibraryResource | null>(null);
  const [activeAgronomist, setActiveAgronomist] = useState<Agronomist | null>(null);
  const [activeSession, setActiveSession] = useState<AgroSession | null>(null);
  const [activeContact, setActiveContact] = useState<Agronomist | null>(null);
  const [activeGroup, setActiveGroup] = useState<FarmerGroup | null>(null);
  const [activeEvent, setActiveEvent] = useState<GroupEvent | null>(null);
  const [activeContribution, setActiveContribution] = useState<GroupContribution | null>(null);
  const [activeStory, setActiveStory] = useState<SuccessStory | null>(null);
  const [activeMetric, setActiveMetric] = useState<BenchmarkMetric | null>(null);
  const [presetService, setPresetService] = useState<string | undefined>(undefined);
  const [presetExpert, setPresetExpert] = useState<Agronomist | null>(null);
  const [presetItem, setPresetItem] = useState<GroupOrderItem | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<FarmerGroup | null>(null);
  const [threadCategory, setThreadCategory] = useState<string | undefined>(undefined);
  const [workspaceTab, setWorkspaceTab] = useState<"chat" | "marketplace" | "events" | "finance">("chat");

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);
  const toastNote = (message: string) => toast.notify(message, "success");

  const joinedGroups = groups.filter((group) => group.joined);
  const kpis: CommunityKpi[] = [
    {
      icon: MessageCircle,
      label: "Forum members",
      value: FORUM_CATEGORIES.reduce((total, item) => total + item.members, 0).toLocaleString("en-KE"),
      note: `${FORUM_CATEGORIES.length} categories · ${threads.length} live threads`,
    },
    {
      icon: BookOpen,
      label: "Library resources",
      value: String(resources.length),
      note: `${LIBRARY_CATEGORIES.length} categories · ${saved.length} saved by you`,
    },
    {
      icon: BadgeCheck,
      label: "Verified agronomists",
      value: String(experts.filter((item) => item.verified).length),
      note: `${COMMUNITY_CONTEXT.expertCredits} free chat + ${COMMUNITY_CONTEXT.photoCredits} free photo left`,
    },
    {
      icon: Handshake,
      label: "Your groups",
      value: String(joinedGroups.length),
      note: `KES ${COMMUNITY_CONTEXT.savingsThisSeason.toLocaleString("en-KE")} saved this season`,
    },
  ];

  /* ------------------------------------------------------------ handlers */

  const postThread = (title: string, category: string, language: string) => {
    const entry = FORUM_CATEGORIES.find((item) => item.name === category) ?? FORUM_CATEGORIES[0];
    const created: ForumThread = {
      id: `t-new-${threads.length + 1}`,
      title,
      category: entry.name,
      subForum: entry.subForums[0],
      author: COMMUNITY_CONTEXT.farmer,
      handle: COMMUNITY_CONTEXT.handle,
      role: "Farmer",
      county: COMMUNITY_CONTEXT.county,
      posted: "20 Sep 2026",
      body: "Thread started from the GrowMO app. Add details or a photo as the discussion develops.",
      replies: [],
      views: 1,
      likes: 0,
      solved: false,
      pinned: false,
      tags: [entry.name.toLowerCase()],
      language: language === "EN" ? "EN" : language.startsWith("Kiswahili") ? "SW" : "Mixed",
    };
    setThreads((current) => [created, ...current]);
    setView("forums");
    toastNote(`Thread published in ${entry.name}. Farmers following the category have been notified.`);
  };

  const replyToThread = (thread: ForumThread, body: string, photo: boolean) => {
    setThreads((current) =>
      current.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              body: item.body,
              replies: [
                ...item.replies,
                {
                  id: `${item.id}-r-${item.replies.length + 1}`,
                  author: COMMUNITY_CONTEXT.farmer,
                  handle: COMMUNITY_CONTEXT.handle,
                  role: "Farmer" as const,
                  county: COMMUNITY_CONTEXT.county,
                  posted: "20 Sep 2026",
                  body,
                  likes: 0,
                  verified: false,
                  photo: photo ? "plot-photo.jpg" : undefined,
                },
              ],
            }
          : item,
      ),
    );
    setActiveThread((current) =>
      current && current.id === thread.id
        ? {
            ...current,
            replies: [
              ...current.replies,
              {
                id: `${current.id}-r-${current.replies.length + 1}`,
                author: COMMUNITY_CONTEXT.farmer,
                handle: COMMUNITY_CONTEXT.handle,
                role: "Farmer" as const,
                county: COMMUNITY_CONTEXT.county,
                posted: "20 Sep 2026",
                body,
                likes: 0,
                verified: false,
                photo: photo ? "plot-photo.jpg" : undefined,
              },
            ],
          }
        : current,
    );
    toastNote("Reply posted. You earn 20 contribution points.");
  };

  const likeThread = (thread: ForumThread, replyId?: string) => {
    const bump = (item: ForumThread): ForumThread =>
      replyId
        ? {
            ...item,
            replies: item.replies.map((reply) =>
              reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply,
            ),
          }
        : { ...item, likes: item.likes + 1 };
    setThreads((current) => current.map((item) => (item.id === thread.id ? bump(item) : item)));
    setActiveThread((current) => (current && current.id === thread.id ? bump(current) : current));
  };

  const markBestAnswer = (thread: ForumThread, replyId: string) => {
    setThreads((current) =>
      current.map((item) => (item.id === thread.id ? { ...item, solved: true } : item)),
    );
    setActiveThread((current) => (current && current.id === thread.id ? { ...current, solved: true } : current));
    const reply = thread.replies.find((item) => item.id === replyId);
    toastNote(`${reply?.author ?? "The agronomist"} answer marked as the best answer — the thread is now closed.`);
  };

  const reportThread = (thread: ForumThread, reason: string) => {
    setReports((current) => [...current, `${thread.id} · ${reason}`]);
    toastNote("Report sent to the community moderators. Verified agronomists review safety reports first.");
  };

  const downloadResource = (resource: LibraryResource) => {
    setResources((current) =>
      current.map((item) =>
        item.id === resource.id ? { ...item, downloads: item.downloads + 1 } : item,
      ),
    );
    downloadText(
      `${resource.id}-summary.csv`,
      [
        ["Field", "Value"],
        ["Title", resource.title],
        ["Kiswahili title", resource.swahiliTitle],
        ["Category", resource.category],
        ["Source", resource.source],
        ["Format", resource.format],
        ["Length", resource.length],
        ["SMS code", resource.smsCode],
        ...resource.chapters.map((chapter, index) => [`Chapter ${index + 1}`, chapter]),
      ]
        .map((row) => row.map(csvCell).join(","))
        .join("\n"),
    );
    toastNote(`${resource.title} downloaded (${resource.size}).`);
  };

  const bookmarkResource = (resource: LibraryResource, folder: string) => {
    setSaved((current) => (current.includes(resource.id) ? current : [...current, resource.id]));
    toastNote(`Saved to ${folder}. You will be told when this resource is revised.`);
  };

  const bookSession = (summary: {
    agronomist: string;
    service: string;
    channel: string;
    cost: number;
    receipt: string;
    date: string;
  }) => {
    setSessions((current) => [
      {
        id: `bk-${current.length + 1}`,
        agronomist: summary.agronomist,
        topic: summary.service,
        date: summary.date,
        channel: summary.service,
        duration: summary.channel,
        cost: summary.cost,
        rating: 0,
        outcome:
          summary.cost === 0
            ? "Free allowance used — request sent to the agronomist"
            : `Paid ${kes(summary.cost)} · scheduled and confirmed`,
        receipt: summary.receipt,
      },
      ...current,
    ]);
    toastNote(
      `${summary.service} requested with ${summary.agronomist}. The session appears in My sessions.`,
    );
  };

  const rateSession = (session: AgroSession, stars: number, comment: string) => {
    setSessions((current) =>
      current.map((item) => (item.id === session.id ? { ...item, rating: stars } : item)),
    );
    toastNote(
      comment.trim().length > 0
        ? `Rated ${stars}/5 and your comment is now visible to other farmers.`
        : `Rated ${stars}/5. Thank you — ratings keep the directory honest.`,
    );
  };

  const joinGroup = (group: FarmerGroup, receipt: string) => {
    setGroups((current) =>
      current.map((item) => (item.id === group.id ? { ...item, joined: true } : item)),
    );
    if (receipt !== "FREE") {
      setContributions((current) => [
        {
          id: `c-new-${current.length + 1}`,
          member: COMMUNITY_CONTEXT.farmer,
          group: group.name,
          purpose: "Membership fee",
          amount: group.fee,
          date: "20 Sep 2026",
          status: "Paid",
          receipt,
        },
        ...current,
      ]);
    }
    toastNote(`You have joined ${group.name}. Group chat and buying are now open to you.`);
  };

  const leaveGroup = (group: FarmerGroup) => {
    setGroups((current) =>
      current.map((item) => (item.id === group.id ? { ...item, joined: false } : item)),
    );
    toastNote(`You have left ${group.name}. Group buying benefits have stopped.`);
  };

  const placeOrder = (summary: {
    item: string;
    quantity: number;
    total: number;
    receipt: string;
    delivery: string;
  }) => {
    setOrders((current) => [
      {
        id: `ord-${current.length + 1}`,
        item: summary.item,
        quantity: summary.quantity,
        total: summary.total,
        receipt: summary.receipt,
        delivery: summary.delivery,
        date: "20 Sep 2026",
      },
      ...current,
    ]);
    toastNote(`${summary.item} added to your orders and to your input purchase records.`);
  };

  const payContribution = (id: string, receipt: string) => {
    setContributions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Paid" as const, receipt } : item,
      ),
    );
    toastNote("Contribution paid — the group ledger has been updated with the M-Pesa receipt.");
  };

  const registerEvent = (event: GroupEvent, attendees: number, receipt: string) => {
    if (receipt === "CANCELLED") {
      setEvents((current) =>
        current.map((item) =>
          item.id === event.id
            ? { ...item, registered: false, taken: Math.max(0, item.taken - 1) }
            : item,
        ),
      );
      toastNote(`Registration for ${event.title} cancelled — your seat is back on the waiting list.`);
      return;
    }
    setEvents((current) =>
      current.map((item) =>
        item.id === event.id
          ? {
              ...item,
              registered: true,
              taken: Math.min(item.seats, item.taken + attendees),
            }
          : item,
      ),
    );
    toastNote(
      receipt === "FREE"
        ? `${event.title} reserved. An SMS reminder goes out the day before.`
        : `Registered ${attendees} for ${event.title} · receipt ${receipt}.`,
    );
  };

  const followStory = (story: SuccessStory) => {
    setFollowed((current) =>
      current.includes(story.id) ? current.filter((id) => id !== story.id) : [...current, story.id],
    );
    toastNote(
      followed.includes(story.id)
        ? `You no longer follow ${story.farmer}.`
        : `Now following ${story.farmer}. New season results from ${story.county} will reach you first.`,
    );
  };

  const shareStory = (story: SuccessStory, channel: string) => {
    toastNote(`${story.farmer}'s story shared via ${channel}.`);
  };

  const applyBenchmark = (metric: BenchmarkMetric, plan: string) => {
    setPlans((current) => [{ metric: metric.metric, plan }, ...current]);
    toastNote(`“${plan}” added to your season plan for ${metric.metric}.`);
  };

  const inviteFarmer = (phone: string, group: string) => {
    toastNote(`SMS invitation sent to ${phone} with a link to ${group}. You earn 50 points if they join.`);
  };

  const sendGroupChat = (body: string) => {
    setGroupChat((current) => [
      ...current,
      {
        id: `cm-${current.length + 1}`,
        author: COMMUNITY_CONTEXT.farmer,
        mine: true,
        at: "10:24",
        body,
      },
    ]);
  };

  const sendExpertChat = (body: string) => {
    setExpertChat((current) => [
      ...current,
      {
        id: `ec-${current.length + 1}`,
        author: COMMUNITY_CONTEXT.farmer,
        mine: true,
        at: "10:26",
        body,
      },
      {
        id: `ec-${current.length + 2}`,
        author: "Peter Otieno",
        mine: false,
        at: "10:27",
        body:
          "Nimeipokea. Nitakujibu kwa kina baada ya kuangalia picha — kwa haraka, usiongeze dawa mpaka tuthibitishe dalili.",
      },
    ]);
  };

  const communityActivity = useMemo(
    () =>
      threads
        .flatMap((thread) =>
          thread.replies.slice(-1).map((reply) => ({
            id: `${thread.id}-${reply.id}`,
            at: reply.posted,
            text: `${reply.author} replied in “${thread.title}” · ${reply.body.slice(0, 92)}…`,
          })),
        )
        .slice(0, 8),
    [threads],
  );

  /* --------------------------------------------------------------- render */

  return (
    <main className="gm-app-page gm-community-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="gm-cm-crumbs">
            <Link to="/app/dashboard" className="gm-back-link gm-cm-back">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Grow</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Community & learning</strong>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setDrawer("activity")}
            >
              <Inbox /> Activity
            </button>
            <div className="gm-menu-wrap gm-cm-menu-wrap">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                aria-expanded={menu}
                onClick={() => setMenu((current) => !current)}
              >
                <MoreHorizontal /> More community tools
              </button>
              {menu ? (
                <div className="gm-dropdown gm-cm-menu">
                  <button
                    type="button"
                    onClick={() => {
                      openModal("invite");
                      setMenu(false);
                    }}
                  >
                    <Users /> Invite a farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("settings");
                      setMenu(false);
                    }}
                  >
                    <Settings2 /> Notification settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("faq");
                      setMenu(false);
                    }}
                  >
                    <HelpCircle /> Community rules & FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadText(
                        "growmo-community-digest.csv",
                        [
                          ["Section", "Item", "Detail", "Value"],
                          ...threads.map((thread) => [
                            "Forum",
                            thread.title,
                            thread.category,
                            `${thread.replies.length} replies`,
                          ]),
                          ...saved.map((id) => [
                            "Saved resource",
                            resources.find((item) => item.id === id)?.title ?? id,
                            "Library",
                            "saved",
                          ]),
                          ...sessions.map((session) => [
                            "Agronomist session",
                            session.topic,
                            session.agronomist,
                            `${session.cost}`,
                          ]),
                          ...orders.map((order) => [
                            "Group order",
                            order.item,
                            order.delivery,
                            `${order.total}`,
                          ]),
                        ]
                          .map((row) => row.map(csvCell).join(","))
                          .join("\n"),
                      );
                      toastNote("Community digest exported as CSV — 4 sections included.");
                      setMenu(false);
                    }}
                  >
                    <Download /> Export my community digest
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawer("activity");
                      setMenu(false);
                    }}
                  >
                    <Activity /> Community activity log
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                      setMenu(false);
                      toast.notify("Printing the community page as it appears on screen.", "info");
                    }}
                  >
                    <Printer /> Print this page
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <Reveal>
          <CommunityHero
            kpis={kpis}
            points={COMMUNITY_CONTEXT.points}
            rank={COMMUNITY_CONTEXT.rank}
            badge={COMMUNITY_CONTEXT.badge}
            actions={
              <>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => {
                    setThreadCategory(undefined);
                    openModal("thread-new");
                  }}
                >
                  <Plus /> Start a discussion
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-gold"
                  onClick={() => setView("experts")}
                >
                  <BadgeCheck /> Ask an agronomist
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => setView("library")}
                >
                  <BookOpen /> Browse the library
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => {
                    setPresetItem(null);
                    openModal("group-order");
                  }}
                >
                  <Package /> Place a group order
                </button>
              </>
            }
          />
        </Reveal>

        <div className="gm-stat-grid my-3">
          <DashboardMetric
            icon={MessageCircle}
            label="Questions asked"
            value={String(COMMUNITY_CONTEXT.questionsAsked)}
            note={`${threads.reduce((total, thread) => total + thread.replies.length, 0)} replies across the forum`}
          />
          <DashboardMetric
            icon={ThumbsUp}
            label="Answers given"
            value={String(COMMUNITY_CONTEXT.answersGiven)}
            note={`${COMMUNITY_CONTEXT.helpfulVotes} helpful votes received`}
          />
          <DashboardMetric
            icon={ClipboardCheck}
            label="Reports filed"
            value={String(reports.length)}
            note="Moderators act on pesticide-safety reports within 24 hours"
          />
          <DashboardMetric
            icon={Eye}
            label="Members reached"
            value="6,240"
            note="Your threads were seen by members in 12 counties this month"
          />
        </div>

        <div className="gm-card p-2">
          <PlannerSubtabs
            label="Community sections"
            value={view}
            onChange={setView}
            items={[
              { id: "forums", label: "Discussion forums", icon: <MessageCircle />, count: threads.length },
              { id: "library", label: "Extension library", icon: <BookOpen />, count: resources.length },
              { id: "experts", label: "Agronomist connect", icon: <BadgeCheck />, count: experts.length },
              { id: "groups", label: "Farmer groups", icon: <Handshake />, count: groups.length },
              { id: "stories", label: "Success stories", icon: <Award />, count: stories.length },
              { id: "benchmarks", label: "Benchmarking", icon: <BarChart3 />, count: BENCHMARK_METRICS.length },
            ]}
          />
        </div>

        <div className="mt-3">
          {view === "forums" ? (
            <ForumsSection
              threads={threads}
              onNewThread={(category) => {
                setThreadCategory(category);
                openModal("thread-new");
              }}
              onOpenThread={(thread) => {
                setActiveThread(thread);
                openModal("thread-detail");
              }}
              onReport={(thread) => {
                setActiveReport(thread);
                openModal("report-thread");
              }}
              onOpenCategory={(category) => {
                setActiveCategory(category);
                openModal("category");
              }}
              onOpenFaq={() => openModal("faq")}
              onCategories={() => openModal("faq")}
            />
          ) : view === "library" ? (
            <LibrarySection
              resources={resources}
              saved={saved}
              onOpen={(resource) => {
                setActiveResource(resource);
                openModal("resource");
              }}
              onBookmark={(resource) => {
                setActiveResource(resource);
                openModal("bookmark");
              }}
              onOffline={(resource) => {
                setActiveResource(resource);
                openModal("resource-offline");
              }}
            />
          ) : view === "experts" ? (
            <ExpertsSection
              experts={experts}
              sessions={sessions}
              onProfile={(expert) => {
                setActiveAgronomist(expert);
                openModal("expert-profile");
              }}
              onRequest={(expert, serviceId) => {
                setPresetExpert(expert ?? null);
                setPresetService(serviceId);
                openModal("expert-request");
              }}
              onRate={(session) => {
                setActiveSession(session);
                openModal("rate-session");
              }}
              onRepeat={(session) => {
                setPresetExpert(
                  experts.find((item) => item.name === session.agronomist) ?? null,
                );
                setPresetService("svc-3");
                openModal("expert-request");
              }}
              onContact={(expert) => {
                setActiveContact(expert);
                openModal("expert-contact");
              }}
              onChat={() => openModal("expert-chat")}
              onAskExpert={() => openModal("ask-expert")}
            />
          ) : view === "groups" ? (
            <GroupsSection
              groups={groups}
              events={events}
              orderItems={GROUP_ORDER_ITEMS}
              contributions={contributions}
              orders={orders}
              messages={groupChat}
              onSendChat={sendGroupChat}
              onOpenWorkspace={(group) => {
                setActiveGroup(group);
                setWorkspaceTab("chat");
                setDrawer("group");
              }}
              onJoin={(group) => {
                setActiveGroup(group);
                openModal("join-group");
              }}
              onLeave={(group) => {
                setLeaveTarget(group);
                openModal("leave-group");
              }}
              onOrder={(item) => {
                setPresetItem(item ?? null);
                openModal("group-order");
              }}
              onContribution={(contribution) => {
                setActiveContribution(contribution);
                openModal("contribution");
              }}
              onEvent={(event) => {
                setActiveEvent(event);
                openModal("event");
              }}
            />
          ) : view === "stories" ? (
            <StoriesSection
              stories={stories}
              followed={followed}
              onOpen={(story) => {
                setActiveStory(story);
                openModal("story");
              }}
              onShare={(story) => {
                setActiveStory(story);
                openModal("share-story");
              }}
              onFollow={followStory}
            />
          ) : (
            <BenchmarksSection
              metrics={BENCHMARK_METRICS}
              plans={plans}
              onCompare={(metric) => {
                setActiveMetric(metric);
                openModal("benchmark");
              }}
              onInvite={() => openModal("invite")}
            />
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- drawers */}

      <DashboardDrawer
        open={drawer === "activity"}
        title="Community activity"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime w-100"
            onClick={() => {
              downloadText(
                "growmo-activity-log.csv",
                [
                  ["Source", "When", "Detail"],
                  ...communityActivity.map((item) => ["Community", item.at, item.text]),
                  ...GROUP_ACTIVITY_LOG.map((item) => ["Group", item.at, item.text]),
                ]
                  .map((row) => row.map(csvCell).join(","))
                  .join("\n"),
              );
              toastNote("Activity log exported as CSV.");
            }}
          >
            <Download /> Export the activity log
          </button>
        }
      >
        <span className="gm-eyebrow">Your community</span>
        {communityActivity.map((item) => (
          <div className="gm-cm-activity" key={item.id}>
            <span>{item.at}</span>
            <p>{item.text}</p>
          </div>
        ))}
        <span className="gm-eyebrow d-block mt-3">Group activity</span>
        {GROUP_ACTIVITY_LOG.map((item) => (
          <div className="gm-cm-activity" key={item.id}>
            <span>{item.at}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "group"}
        title={activeGroup ? `${activeGroup.name} · group workspace` : "Group workspace"}
        onClose={() => setDrawer(null)}
        footer={
          activeGroup ? (
            <div className="d-flex flex-wrap gap-2 w-100">
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  setPresetItem(null);
                  openModal("group-order");
                }}
              >
                <Package /> Order inputs
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => {
                  setActiveEvent(events.find((event) => event.group === activeGroup.name) ?? events[0]);
                  openModal("event");
                }}
              >
                <CalendarDays /> Training calendar
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-soft"
                onClick={() => {
                  setActiveContribution(
                    contributions.find((item) => item.group === activeGroup.name) ?? contributions[0],
                  );
                  openModal("contribution");
                }}
              >
                <Coins /> Group financials
              </button>
            </div>
          ) : null
        }
      >
        {activeGroup ? (
          <>
            <CommunityKv
              rows={[
                { label: "County & focus", value: `${activeGroup.county} · ${activeGroup.focus}` },
                { label: "Members", value: activeGroup.members.toLocaleString("en-KE") },
                {
                  label: "Fee",
                  value:
                    activeGroup.fee === 0
                      ? "Free to join"
                      : `${kes(activeGroup.fee)} ${activeGroup.feeUnit}`,
                },
                { label: "Meeting rhythm", value: activeGroup.meeting },
                { label: "Contact", value: activeGroup.contact },
                { label: "Status", value: activeGroup.joined ? "Member" : "Not a member" },
              ]}
            />
            <div className="gm-card p-2 mt-3">
              <PlannerSubtabs
                label="Group workspace views"
                value={workspaceTab}
                onChange={setWorkspaceTab}
                items={[
                  { id: "chat", label: "Chat", icon: <MessageCircle /> },
                  { id: "marketplace", label: "Buying", icon: <Package /> },
                  { id: "events", label: "Events", icon: <CalendarDays /> },
                  { id: "finance", label: "Financials", icon: <Coins /> },
                ]}
              />
            </div>

            {workspaceTab === "chat" ? (
              <div className="mt-3">
                <ChatThread
                  messages={groupChat}
                  placeholder={`Andika kwa ${activeGroup.name}…`}
                  note={`${activeGroup.members.toLocaleString("en-KE")} members can read this chat. Market prices shared here are member reports, not verified prices.`}
                  onSend={sendGroupChat}
                />
              </div>
            ) : workspaceTab === "marketplace" ? (
              <div className="mt-3">
                <span className="gm-eyebrow">Open group orders</span>
                <div className="gm-table-wrap mt-2">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Group price</th>
                        <th>Closes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GROUP_ORDER_ITEMS.slice(0, 6).map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.item}</strong>
                          </td>
                          <td className="font-display">
                            {kes(item.groupPrice)} / {item.unit}
                          </td>
                          <td>{item.closes}</td>
                          <td>
                            <button
                              type="button"
                              className="gm-btn gm-btn-soft gm-btn-sm"
                              onClick={() => {
                                setPresetItem(item);
                                openModal("group-order");
                              }}
                            >
                              Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <span className="gm-eyebrow d-block mt-3">Your recent orders</span>
                {orders.length === 0 ? (
                  <p className="text-muted mt-2">
                    No order placed yet. Orders you place appear here and in your records.
                  </p>
                ) : (
                  orders.map((order) => (
                    <div className="gm-cm-activity" key={order.id}>
                      <span>{order.date}</span>
                      <p>
                        {order.quantity} × {order.item} · {kes(order.total)} · {order.receipt} ·
                        collect at {order.delivery}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : workspaceTab === "events" ? (
              <div className="mt-3">
                {events
                  .filter((event) => event.group === activeGroup.name)
                  .map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      onRegister={() => {
                        setActiveEvent(event);
                        openModal("event");
                      }}
                    />
                  ))}
                {events.filter((event) => event.group === activeGroup.name).length === 0 ? (
                  <p className="text-muted">
                    No event scheduled for this group yet. Training dates are posted after
                    the committee meeting on the first Saturday of the month.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-3">
                <div className="gm-cm-kv">
                  <div>
                    <dt>Paid contributions</dt>
                    <dd>
                      {kes(
                        contributions
                          .filter(
                            (item) =>
                              item.group === activeGroup.name && item.status === "Paid",
                          )
                          .reduce((total, item) => total + item.amount, 0),
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Outstanding</dt>
                    <dd>
                      {kes(
                        contributions
                          .filter(
                            (item) =>
                              item.group === activeGroup.name && item.status !== "Paid",
                          )
                          .reduce((total, item) => total + item.amount, 0),
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Collective marketing levy</dt>
                    <dd>2% on gross sales</dd>
                  </div>
                  <div>
                    <dt>Input loan fund</dt>
                    <dd>{kes(480000)}</dd>
                  </div>
                </div>
                <span className="gm-eyebrow d-block mt-3">Ledger rows for this group</span>
                {contributions
                  .filter((item) => item.group === activeGroup.name)
                  .map((item) => (
                    <div className="gm-cm-activity" key={item.id}>
                      <span>{item.date}</span>
                      <p>
                        {item.purpose} · {item.amount === 0 ? "Free" : kes(item.amount)} ·{" "}
                        {item.status}
                      </p>
                      {item.status !== "Paid" ? (
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => {
                            setActiveContribution(item);
                            openModal("contribution");
                          }}
                        >
                          Pay
                        </button>
                      ) : null}
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : null}
      </DashboardDrawer>

      {/* -------------------------------------------------------- dialogs */}

      <NewThreadWizard
        open={modal === "thread-new"}
        defaultCategory={threadCategory}
        onClose={closeModal}
        onPosted={postThread}
      />

      <ThreadDetailDialog
        open={modal === "thread-detail"}
        thread={activeThread}
        onClose={closeModal}
        onReply={replyToThread}
        onLike={likeThread}
        onMarkBest={markBestAnswer}
        onReport={(thread) => {
          setActiveReport(thread);
          openModal("report-thread");
        }}
        onAskExpert={() => openModal("ask-expert")}
      />

      <ReportContentDialog
        open={modal === "report-thread"}
        thread={activeReport}
        onClose={closeModal}
        onReported={(reason) => {
          if (activeReport) reportThread(activeReport, reason);
        }}
      />

      <CategoryThreadsDialog
        open={modal === "category"}
        category={activeCategory}
        threads={threads}
        onClose={closeModal}
        onOpenThread={(thread) => {
          setActiveThread(thread);
          openModal("thread-detail");
        }}
        onNewThread={(category) => {
          setThreadCategory(category.name);
          openModal("thread-new");
        }}
      />

      <FaqDialog open={modal === "faq"} onClose={closeModal} onAsk={() => openModal("ask-expert")} />

      <ResourcePreviewDialog
        open={modal === "resource"}
        resource={activeResource}
        onClose={closeModal}
        onDownload={downloadResource}
        onBookmark={(resource) => {
          setActiveResource(resource);
          openModal("bookmark");
        }}
        onRequestOffline={(resource) => {
          setActiveResource(resource);
          openModal("resource-offline");
        }}
      />

      <ResourceRequestDialog
        open={modal === "resource-offline"}
        resource={activeResource}
        onClose={closeModal}
        onRequested={(resource) => {
          setResources((current) =>
            current.map((item) =>
              item.id === resource.id ? { ...item, downloads: item.downloads + 1 } : item,
            ),
          );
        }}
      />

      <BookmarkDialog
        open={modal === "bookmark"}
        resource={activeResource}
        onClose={closeModal}
        onSaved={bookmarkResource}
      />

      <AgronomistRequestWizard
        open={modal === "expert-request"}
        presetService={presetService}
        presetAgronomist={presetExpert}
        onClose={closeModal}
        onBooked={bookSession}
      />

      <AgronomistProfileDialog
        open={modal === "expert-profile"}
        agronomist={activeAgronomist}
        onClose={closeModal}
        onRequest={(expert) => {
          setPresetExpert(expert);
          setPresetService(undefined);
          openModal("expert-request");
        }}
        onChat={() => openModal("expert-chat")}
      />

      <SessionDetailDialog
        open={modal === "session-detail"}
        session={activeSession}
        onClose={closeModal}
        onRate={(session) => {
          setActiveSession(session);
          openModal("rate-session");
        }}
        onRepeat={(session) => {
          setPresetExpert(experts.find((item) => item.name === session.agronomist) ?? null);
          setPresetService("svc-3");
          openModal("expert-request");
        }}
      />

      <RateSessionDialog
        open={modal === "rate-session"}
        session={activeSession}
        onClose={closeModal}
        onRated={rateSession}
      />

      <ExpertContactDialog
        open={modal === "expert-contact"}
        agronomist={activeContact}
        onClose={closeModal}
        onCall={(expert) => {
          setPresetExpert(expert);
          setPresetService("svc-3");
          openModal("expert-request");
        }}
        onSms={(expert) =>
          toastNote(`SMS drafted to ${expert.name} on ${expert.phone}. Reply to the confirmation to send it.`)
        }
        onEmail={(expert) =>
          toastNote(`Email request queued to the ${expert.counties} extension desk.`)
        }
      />

      <AskExpertDialog
        open={modal === "ask-expert"}
        onClose={closeModal}
        onSent={(question) => {
          toastNote(
            `Question sent to the verified agronomists. “${question.slice(0, 44)}…” will also be posted in the Ask the Expert forum.`,
          );
          setView("forums");
        }}
      />

      <Dialog
        open={modal === "expert-chat"}
        onClose={closeModal}
        title="Chat with Peter Otieno"
        desc="Verified agronomist · Kiambu, Nairobi, Murang'a · replies within 2 hours"
      >
        <ChatThread
          messages={expertChat}
          placeholder="Uliza swali lako la kilimo…"
          note="Free chat sessions: 2 per month, then KES 50 per session. This chat stays open for the season."
          onSend={sendExpertChat}
        />
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button type="button" className="gm-btn gm-btn-outline" onClick={closeModal}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => {
              setPresetExpert(experts[0]);
              setPresetService("svc-2");
              openModal("expert-request");
            }}
          >
            <Plus /> Request photo diagnosis
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              setActiveSession(sessions[0]);
              openModal("session-detail");
            }}
          >
            <ClipboardCheck /> View session record
          </button>
        </div>
      </Dialog>

      <JoinGroupWizard
        open={modal === "join-group"}
        group={activeGroup}
        onClose={closeModal}
        onJoined={joinGroup}
      />

      <LeaveGroupDialog
        open={modal === "leave-group"}
        group={leaveTarget}
        onClose={closeModal}
        onLeft={leaveGroup}
      />

      <GroupBuyingWizard
        open={modal === "group-order"}
        initialItem={presetItem}
        onClose={closeModal}
        onOrdered={placeOrder}
      />

      <ContributionDialog
        open={modal === "contribution"}
        contribution={activeContribution}
        onClose={closeModal}
        onPaid={payContribution}
      />

      <EventRegisterDialog
        open={modal === "event"}
        event={activeEvent}
        onClose={closeModal}
        onRegistered={registerEvent}
      />

      <StoryDetailDialog
        open={modal === "story"}
        story={activeStory}
        onClose={closeModal}
        onFollow={(story) => {
          followStory(story);
          closeModal();
        }}
        onShare={(story) => {
          setActiveStory(story);
          openModal("share-story");
        }}
      />

      <ShareStoryDialog
        open={modal === "share-story"}
        story={activeStory}
        onClose={closeModal}
        onShared={shareStory}
      />

      <BenchmarkCompareDialog
        open={modal === "benchmark"}
        metric={activeMetric}
        onClose={closeModal}
        onApply={applyBenchmark}
      />

      <InviteFarmerDialog
        open={modal === "invite"}
        onClose={closeModal}
        onInvited={inviteFarmer}
      />

      <CommunitySettingsDialog
        open={modal === "settings"}
        settings={settings}
        onClose={closeModal}
        onSave={(next) => {
          setSettings(next);
          toastNote("Community settings saved. Digest and alerts updated.");
        }}
      />
    </main>
  );
}

/* FAQ pop-up — the rules, the data-sharing explanation and a link to ask. */
function FaqDialog({
  open,
  onClose,
  onAsk,
}: {
  open: boolean;
  onClose: () => void;
  onAsk: () => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Community rules & frequently asked questions"
      desc="How GrowMO keeps advice safe, how points work, and what your group can see."
    >
      <div className="gm-cm-stack">
        <div className="gm-cm-faq">
          {COMMUNITY_FAQ.map((item, index) => (
            <div key={item.q}>
              <button
                type="button"
                className="gm-cm-faq-row"
                aria-expanded={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <HelpCircle />
                {item.q}
                <i>{openIndex === index ? "Hide" : "Show answer"}</i>
              </button>
              {openIndex === index ? (
                <div className="p-3" style={{ background: "var(--gm-mint-50)" }}>
                  <p className="mb-0" style={{ fontSize: "0.86rem" }}>
                    {item.a}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="gm-cm-callout">
          <AlertTriangle />
          <span>
            <strong>Report, do not argue</strong>
            <small>
              Use the report button on any thread that gives unsafe pesticide advice.
              Ten reports hide a thread until a verified agronomist reviews it.
            </small>
          </span>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <Link to="/app/records" className="gm-btn gm-btn-soft">
            <ClipboardCheck /> See what your records share
          </Link>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onClose();
              onAsk();
            }}
          >
            <BadgeCheck /> Ask a verified agronomist
          </button>
        </div>
      </div>
    </Dialog>
  );
}
