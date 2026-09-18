import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardList,
  Fingerprint,
  Sprout,
  Store,
  TrendingUp,
  Wallet,
  Wheat,
} from "lucide-react";
import { APP_NAV } from "../../data/app/nav";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/")({ component: AppHomePage });

const SETUP = [
  {
    icon: Sprout,
    t: "Complete your farm profile",
    d: "Plots, soil, assets, M-Pesa",
    to: "/app/onboarding",
    done: false,
  },
  {
    icon: BadgeCheck,
    t: "Verify your identity",
    d: "Unlock KES 500K M-Pesa limits",
    to: "/auth/identity",
    done: true,
  },
  {
    icon: Fingerprint,
    t: "Add a passkey",
    d: "Fingerprint sign-in on this phone",
    to: "/auth/passkeys",
    done: true,
  },
  {
    icon: Store,
    t: "Stock up for the rains",
    d: "Certified seeds, fertilizer, drip kits",
    to: "/shop",
    done: false,
  },
];

const SNAPSHOT = [
  {
    icon: Wheat,
    label: "Active crops",
    value: "3",
    sub: "Cabbage · Maize · Beans",
  },
  {
    icon: Wallet,
    label: "Wallet balance",
    value: kes(35000),
    sub: "M-Pesa linked",
  },
  { icon: ClipboardList, label: "Tasks today", value: "5", sub: "2 urgent" },
  {
    icon: TrendingUp,
    label: "Cabbage price",
    value: "KES 32/head",
    sub: "Wakulima · rising",
  },
];

function AppHomePage() {
  const doneCount = SETUP.filter((s) => s.done).length;
  const pct = Math.round((doneCount / SETUP.length) * 100);
  const modules = APP_NAV.flatMap((g) =>
    g.items.filter((i) => i.to !== "/app"),
  );
  const liveCount = modules.filter((m) => m.ready).length;

  return (
    <div>
      {/* ---------- page header ---------- */}
      <header className="gm-dash-head">
        <span className="gm-eyebrow">
          <span className="dot" /> Farm OS · Short rains season
        </span>
        <h1>Habari, Mary — let&apos;s set up your farm</h1>
        <p className="gm-lead">
          Day 24 of your cabbage season. Finish the {SETUP.length} setup steps,
          then each module below unlocks as its page ships.
        </p>
      </header>

      {/* ---------- setup checklist ---------- */}
      <section className="gm-dash-card">
        <div className="gm-dash-section-title">
          <h2>Farm setup</h2>
          <span className="gm-chip">
            {doneCount}/{SETUP.length} done · {pct}%
          </span>
        </div>
        <div
          className="gm-progress"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="gm-setup-grid">
          {SETUP.map((s) => (
            <Link key={s.t} to={s.to} className="gm-option-row gm-setup-row">
              <span className="gm-mega-icon">
                <s.icon />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{s.t}</strong>
                <small>{s.d}</small>
              </span>
              {s.done ? (
                <span className="gm-chip">
                  <Check width={13} height={13} /> Done
                </span>
              ) : (
                <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- snapshot ---------- */}
      <div className="gm-dash-section-title">
        <h2>Today at a glance</h2>
      </div>
      <div className="gm-stat-grid">
        {SNAPSHOT.map((s) => (
          <div key={s.label} className="gm-stat">
            <span className="gm-mega-icon">
              <s.icon />
            </span>
            <span className="gm-stat-value">{s.value}</span>
            <span className="gm-stat-label">{s.label}</span>
            <span className="gm-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ---------- module map ---------- */}
      <div className="gm-dash-section-title">
        <h2>Your {modules.length} modules</h2>
        <span className="gm-chip">{liveCount} live</span>
      </div>
      <div className="gm-module-grid">
        {modules.map((m) => (
          <div
            key={m.to}
            className={`gm-module ${m.ready ? "" : "is-soon"}`}
            title={m.ready ? m.label : `${m.label} — coming soon`}
          >
            <span className="gm-mega-icon">
              <m.icon />
            </span>
            <strong>{m.label}</strong>
            <small>{m.desc}</small>
          </div>
        ))}
      </div>

      {/* ---------- CTA ---------- */}
      <div className="gm-cta-band mt-5 text-center">
        <h2 className="font-display" style={{ color: "#fff" }}>
          New here? Tour the platform first
        </h2>
        <p style={{ color: "rgba(255,255,255,.85)" }}>
          See what each module does before its page ships.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
          <Link to="/services" className="gm-btn gm-btn-lime">
            Explore services <ArrowRight />
          </Link>
          <Link to="/shop" className="gm-btn gm-btn-ghost">
            <Store /> Shop inputs
          </Link>
        </div>
      </div>
    </div>
  );
}
