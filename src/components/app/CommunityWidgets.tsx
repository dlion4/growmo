/* ============================================================================
   PAGE 13 WIDGETS — community, learning & benchmarking building blocks.
   Presentation only: master-theme classes plus the additive .gm-cm-* layer in
   community.css (documented in docs/MASTER_THEME.md §16). Nothing here invents
   a colour, font, radius or shadow.
   ========================================================================== */
import {
  Award,
  BadgeCheck,
  Bug,
  CalendarDays,
  CloudSun,
  Coins,
  Gauge,
  Handshake,
  MapPin,
  MessageCircle,
  Package,
  Send,
  Sprout,
  ThumbsUp,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type {
  Agronomist,
  BenchmarkMetric,
  FarmerGroup,
  ForumCategory,
  ForumThread,
  GroupEvent,
  LibraryResource,
  SuccessStory,
} from "../../data/app/community";

export interface CommunityBadgeLike {
  id: string;
  label: string;
  detail: string;
  earned: boolean;
}
import { StatusChip } from "./DashboardWidgets";

/* ---------------------------------------------------------------- hero */

export interface CommunityKpi {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}

export function CommunityHero({
  kpis,
  actions,
  points,
  rank,
  badge,
}: {
  kpis: CommunityKpi[];
  actions: ReactNode;
  points: number;
  rank: number;
  badge: string;
}) {
  return (
    <section className="gm-cm-hero">
      <div className="gm-cm-hero-head">
        <div>
          <span className="gm-eyebrow on-dark">
            <span className="dot" />
            13 · Community · Learning · Benchmarking
          </span>
          <h1 className="gm-h-section mb-2">
            Learn from the shamba next door
          </h1>
          <p className="gm-lead on-dark mb-0">
            Forums, KALRO extension material, verified agronomists, farmer groups
            and honest peer benchmarks — so a lesson learnt in Kiambu does not have
            to be learnt again in Kisumu.
          </p>
        </div>
        <div className="gm-cm-score">
          <Award />
          <strong className="font-display">{points.toLocaleString("en-KE")}</strong>
          <small>contribution points</small>
          <StatusChip label={`Rank #${rank}`} tone="low" />
          <span className="gm-cm-badge-line">
            <BadgeCheck /> {badge}
          </span>
        </div>
      </div>

      <div className="gm-cm-kpi-grid">
        {kpis.map((kpi) => (
          <div className="gm-cm-kpi" key={kpi.label}>
            <span className="gm-mega-icon">
              <kpi.icon />
            </span>
            <strong className="font-display">{kpi.value}</strong>
            <span>{kpi.label}</span>
            <small>{kpi.note}</small>
          </div>
        ))}
      </div>

      <div className="gm-cm-hero-actions">{actions}</div>
    </section>
  );
}

/* ------------------------------------------------------ forum categories */

const CATEGORY_ICON: Record<string, LucideIcon> = {
  sprout: Sprout,
  map: MapPin,
  coins: Coins,
  bug: Bug,
  gauge: Gauge,
  badge: BadgeCheck,
  warehouse: Warehouse,
  package: Package,
  cloud: CloudSun,
  users: Users,
};

export function ForumCategoryCard({
  category,
  onOpen,
}: {
  category: ForumCategory;
  onOpen: () => void;
}) {
  const Icon = CATEGORY_ICON[category.icon] ?? MessageCircle;
  return (
    <article className={`gm-cm-cat tone-${category.accent}`}>
      <span className="gm-mega-icon">
        <Icon />
      </span>
      <strong>{category.name}</strong>
      <small>{category.subForums.join(" · ")}</small>
      <div className="gm-cm-cat-foot">
        <span>
          <strong className="font-display">{category.members.toLocaleString("en-KE")}</strong>{" "}
          members
        </span>
        <span>
          <strong className="font-display">{category.threads}</strong> threads
        </span>
      </div>
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
        Open forum
      </button>
    </article>
  );
}

export function ThreadRow({
  thread,
  onOpen,
}: {
  thread: ForumThread;
  onOpen: () => void;
}) {
  return (
    <article className="gm-cm-thread">
      <div className="gm-cm-thread-main">
        <div className="gm-cm-thread-head">
          {thread.pinned ? <StatusChip label="Pinned" tone="low" /> : null}
          {thread.solved ? <StatusChip label="Solved" tone="low" /> : null}
          <StatusChip label={thread.category} tone="neutral" />
          <StatusChip label={thread.language === "SW" ? "Kiswahili" : thread.language === "EN" ? "English" : "EN + SW"} tone="neutral" />
        </div>
        <button type="button" className="gm-cm-thread-title" onClick={onOpen}>
          {thread.title}
        </button>
        <p className="gm-cm-thread-body">
          {thread.body.length > 168 ? `${thread.body.slice(0, 168)}…` : thread.body}
        </p>
        <div className="gm-cm-thread-meta">
          <span>
            <strong>{thread.author}</strong> {thread.handle} · {thread.county}
          </span>
          <span>{thread.posted}</span>
        </div>
      </div>
      <div className="gm-cm-thread-side">
        <span className="font-display">{thread.replies.length}</span>
        <small>replies</small>
        <span className="gm-cm-likes">
          <ThumbsUp /> {thread.likes}
        </span>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Read thread
        </button>
      </div>
    </article>
  );
}

/* --------------------------------------------------------- library cards */

export function ResourceCard({
  resource,
  onPreview,
  onBookmark,
}: {
  resource: LibraryResource;
  onPreview: () => void;
  onBookmark: () => void;
}) {
  return (
    <article className="gm-cm-resource">
      <div className="gm-cm-resource-top">
        <span className="gm-chip gm-chip-lime">{resource.format}</span>
        <StatusChip label={resource.language} tone="neutral" />
      </div>
      <strong>{resource.title}</strong>
      <small className="gm-cm-resource-sw">{resource.swahiliTitle}</small>
      <p>{resource.summary.length > 120 ? `${resource.summary.slice(0, 120)}…` : resource.summary}</p>
      <div className="gm-cm-resource-meta">
        <span>{resource.source}</span>
        <span>
          {resource.length} · {resource.size}
        </span>
        <span>
          {resource.downloads.toLocaleString("en-KE")} downloads · ★ {resource.rating}
        </span>
      </div>
      <div className="gm-cm-resource-foot">
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onPreview}>
          Open resource
        </button>
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onBookmark}>
          Save
        </button>
        <span className="gm-code-chip">{resource.smsCode}</span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------ agronomist cards */

export function AgronomistCard({
  agronomist,
  onProfile,
  onRequest,
}: {
  agronomist: Agronomist;
  onProfile: () => void;
  onRequest: () => void;
}) {
  return (
    <article className="gm-cm-expert">
      <div className="gm-cm-expert-head">
        <span className="gm-avatar">{agronomist.name.charAt(0)}</span>
        <div>
          <strong>{agronomist.name}</strong>
          <small>{agronomist.title}</small>
        </div>
        {agronomist.verified ? <StatusChip label="Verified" tone="low" /> : null}
      </div>
      <p className="gm-cm-expert-spec">{agronomist.speciality}</p>
      <div className="gm-cm-expert-meta">
        <span>★ {agronomist.rating} · {agronomist.sessions} sessions</span>
        <span>{agronomist.years} years</span>
        <span>{agronomist.responseTime}</span>
      </div>
      <small className="gm-cm-expert-counties">
        <MapPin /> {agronomist.counties} · {agronomist.languages}
      </small>
      <div className="gm-cm-expert-foot">
        <strong className="font-display">
          {agronomist.fee === 0 ? "Free (county officer)" : `KES ${agronomist.fee}`}
        </strong>
        <div className="d-flex gap-2">
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onProfile}>
            Profile
          </button>
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onRequest}>
            Ask
          </button>
        </div>
      </div>
    </article>
  );
}

export function ServiceRow({
  service,
  used,
  onBook,
}: {
  service: {
    id: string;
    label: string;
    detail: string;
    free: string;
    cost: number;
    unit: string;
    days: string;
  };
  used: string;
  onBook: () => void;
}) {
  return (
    <tr>
      <td>
        {service.label}
        <small className="d-block text-muted">{service.detail}</small>
      </td>
      <td>{service.free}</td>
      <td className="font-display">
        {service.cost === 0 ? "Free" : `KES ${service.cost.toLocaleString("en-KE")}`}
        <small className="d-block text-muted">{service.unit}</small>
      </td>
      <td>{service.days}</td>
      <td>{used}</td>
      <td>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onBook}>
          Request
        </button>
      </td>
    </tr>
  );
}

/* ----------------------------------------------------------- group cards */

export function GroupCard({
  group,
  onOpen,
  onJoin,
  onLeave,
}: {
  group: FarmerGroup;
  onOpen: () => void;
  onJoin: () => void;
  onLeave: () => void;
}) {
  return (
    <article className="gm-cm-group">
      <div className="gm-cm-group-head">
        <span className="gm-mega-icon">
          <Handshake />
        </span>
        <div>
          <strong>{group.name}</strong>
          <small>
            <MapPin /> {group.county} · {group.focus}
          </small>
        </div>
        {group.joined ? <StatusChip label="Member" tone="low" /> : null}
      </div>
      <p>{group.about}</p>
      <div className="gm-cm-group-stats">
        <span>
          <strong className="font-display">{group.members.toLocaleString("en-KE")}</strong> members
        </span>
        <span>
          <strong className="font-display">
            {group.fee === 0 ? "Free" : `KES ${group.fee.toLocaleString("en-KE")}`}
          </strong>{" "}
          {group.feeUnit}
        </span>
      </div>
      <div className="gm-cm-group-tags">
        {group.activities.map((activity) => (
          <span className="gm-chip gm-chip-ghost" key={activity}>
            {activity}
          </span>
        ))}
      </div>
      <small className="gm-cm-group-savings">{group.savings}</small>
      <div className="gm-cm-group-foot">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Group workspace
        </button>
        {group.joined ? (
          <button type="button" className="gm-btn gm-btn-danger-soft gm-btn-sm" onClick={onLeave}>
            Leave
          </button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onJoin}>
            Join group
          </button>
        )}
      </div>
    </article>
  );
}

export function EventRow({
  event,
  onRegister,
}: {
  event: GroupEvent;
  onRegister: () => void;
}) {
  return (
    <div className="gm-check-row gm-cm-event">
      <CalendarDays />
      <span style={{ flex: 1 }}>
        <strong>{event.title}</strong>
        <small>
          {event.group} · {event.county} · {event.mode} · {event.topic}
        </small>
      </span>
      <StatusChip
        label={event.fee === 0 ? "Free" : `KES ${event.fee}`}
        tone={event.fee === 0 ? "low" : "neutral"}
      />
      <StatusChip
        label={`${event.taken}/${event.seats} seats`}
        tone={event.taken >= event.seats ? "high" : "medium"}
      />
      <button
        type="button"
        className={`gm-btn gm-btn-sm ${event.registered ? "gm-btn-outline" : "gm-btn-lime"}`}
        onClick={onRegister}
      >
        {event.registered ? "Manage" : "Register"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------- success stories */

export function StoryCard({
  story,
  onOpen,
}: {
  story: SuccessStory;
  onOpen: () => void;
}) {
  return (
    <article className="gm-cm-story">
      <div className="gm-cm-story-head">
        <span className="gm-avatar">{story.farmer.charAt(0)}</span>
        <div>
          <strong>{story.farmer}</strong>
          <small>
            <MapPin /> {story.county} · {story.crop} · {story.acres}
          </small>
        </div>
        {story.verified ? <StatusChip label="Verified" tone="low" /> : null}
      </div>
      <strong className="gm-cm-story-achievement">{story.achievement}</strong>
      <blockquote className="gm-cm-quote">“{story.quote}”</blockquote>
      <div className="gm-cm-story-compare">
        <span>
          <small>Before</small>
          <strong className="font-display">{story.before}</strong>
        </span>
        <span>
          <small>After</small>
          <strong className="font-display">{story.after}</strong>
        </span>
      </div>
      <div className="gm-cm-story-foot">
        <span className="gm-chip gm-chip-gold">{story.income}</span>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Read the full story
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------- benchmarking */

export function BenchmarkBar({
  metric,
  onCompare,
}: {
  metric: BenchmarkMetric;
  onCompare: () => void;
}) {
  const values = [metric.mine, metric.countyAvg, metric.top25, metric.peerTop];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pos = (value: number) => `${((value - min) / span) * 100}%`;
  const better =
    metric.higherIsBetter ? metric.mine >= metric.countyAvg : metric.mine <= metric.countyAvg;
  return (
    <div className="gm-cm-bench">
      <div className="gm-cm-bench-head">
        <span>
          <strong>{metric.metric}</strong>
          <small>
            {metric.unit} · {metric.note}
          </small>
        </span>
        <StatusChip
          label={better ? "Ahead of county" : "Behind county"}
          tone={better ? "low" : "medium"}
        />
      </div>
      <div className="gm-cm-bench-track">
        <i className="mark county" style={{ left: pos(metric.countyAvg) }} />
        <i className="mark top25" style={{ left: pos(metric.top25) }} />
        <i className="mark peerTop" style={{ left: pos(metric.peerTop) }} />
        <i className="mark mine" style={{ left: pos(metric.mine) }} />
      </div>
      <div className="gm-cm-bench-values">
        <span>
          <em className="mine" /> Mine <strong className="font-display">{metric.mine.toLocaleString("en-KE")}</strong>
        </span>
        <span>
          <em className="county" /> County <strong className="font-display">{metric.countyAvg.toLocaleString("en-KE")}</strong>
        </span>
        <span>
          <em className="top25" /> Top 25% <strong className="font-display">{metric.top25.toLocaleString("en-KE")}</strong>
        </span>
        <span>
          <em className="peerTop" /> Best peer <strong className="font-display">{metric.peerTop.toLocaleString("en-KE")}</strong>
        </span>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onCompare}>
          Compare
        </button>
      </div>
    </div>
  );
}

export function LeaderboardRow({
  row,
  mine,
}: {
  row: {
    id: string;
    rank: number;
    farmer: string;
    county: string;
    points: number;
    badge: string;
    answers: number;
  };
  mine: boolean;
}) {
  return (
    <div className={`gm-cm-leader ${mine ? "is-mine" : ""}`}>
      <span className="gm-cm-rank font-display">{row.rank}</span>
      <span style={{ flex: 1 }}>
        <strong>{row.farmer}</strong>
        <small>
          {row.county} · {row.badge} · {row.answers} answers
        </small>
      </span>
      <strong className="font-display">{row.points.toLocaleString("en-KE")}</strong>
    </div>
  );
}

export function BadgeTile({ badge }: { badge: CommunityBadgeLike }) {
  return (
    <div className={`gm-cm-badge ${badge.earned ? "is-earned" : ""}`}>
      <Award />
      <span>
        <strong>{badge.label}</strong>
        <small>{badge.detail}</small>
      </span>
      <StatusChip label={badge.earned ? "Earned" : "Locked"} tone={badge.earned ? "low" : "neutral"} />
    </div>
  );
}

/* ------------------------------------------------------------ chat block */

export interface ChatMessage {
  id: string;
  author: string;
  mine: boolean;
  at: string;
  body: string;
}

export function ChatThread({
  messages,
  placeholder,
  note,
  onSend,
}: {
  messages: ChatMessage[];
  placeholder: string;
  note: string;
  onSend: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="gm-cm-chat">
      <div className="gm-cm-chat-thread">
        {messages.map((message) => (
          <div className={`gm-cm-msg ${message.mine ? "is-me" : ""}`} key={message.id}>
            <span className="gm-cm-msg-ava">
              {message.mine ? "MW" : message.author.slice(0, 2).toUpperCase()}
            </span>
            <div className="gm-cm-bubble">
              <strong>
                {message.author} <small>{message.at}</small>
              </strong>
              <p>{message.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="gm-cm-composer">
        <input
          className="gm-input"
          value={draft}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && draft.trim()) {
              onSend(draft.trim());
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!draft.trim()}
          onClick={() => {
            onSend(draft.trim());
            setDraft("");
          }}
        >
          <Send /> Send
        </button>
      </div>
      <small className="gm-cm-chat-note">{note}</small>
    </div>
  );
}

export function CommunityKv({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="gm-cm-kv">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
