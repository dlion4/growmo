import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, ClipboardList, Fingerprint, Sprout, Store, TrendingUp, Wallet, Wheat } from "lucide-react";
import { Reveal } from "../../components/ui/primitives";
import { APP_NAV } from "../../data/app/nav";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/")({ component: AppHomePage });

const SETUP = [
  { icon: Sprout, t: "Complete your farm profile", d: "Page 1 · plots, soil, assets, M-Pesa", to: "/app/onboarding", done: false },
  { icon: BadgeCheck, t: "Verify your identity", d: "Unlock KES 500K M-Pesa limits", to: "/auth/identity", done: true },
  { icon: Fingerprint, t: "Add a passkey", d: "Fingerprint sign-in on this phone", to: "/auth/passkeys", done: true },
  { icon: Store, t: "Stock up for the rains", d: "Certified seeds, fertilizer, drip kits", to: "/shop", done: false },
];

function AppHomePage() {
  const doneCount = SETUP.filter((s) => s.done).length;
  const pct = Math.round((doneCount / SETUP.length) * 100);
  const modules = APP_NAV.flatMap((g) => g.items.filter((i) => i.to !== "/app"));

  return (
    <div>
      <Reveal>
        <span className="gm-eyebrow">
          <span className="dot" /> Farm OS · Short rains season
        </span>
        <h1 className="gm-h-section">Habari, Mary — let's set up your farm</h1>
        <p className="gm-lead">
          Thursday, 17 September 2026 · Day 24 of your cabbage season. Finish the 4 setup steps,
          then each module below unlocks as its page ships.
        </p>
      </Reveal>

      {/* setup progress */}
      <Reveal delay={0.08}>
        <div className="gm-auth-card mt-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h2 style={{ fontSize: "1.2rem" }}>Farm setup — {doneCount} of {SETUP.length} done</h2>
            <span className="gm-chip">{pct}% complete</span>
          </div>
          <div style={{ height: 10, borderRadius: 99, background: "var(--gm-mint-100)", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "var(--gm-grad-primary)", transition: "width .6s var(--gm-ease)" }} />
          </div>
          <div className="row g-2">
            {SETUP.map((s) => (
              <div key={s.t} className="col-md-6">
                <Link to={s.to} className="gm-option-row" style={{ marginBottom: 0 }}>
                  <span className="gm-mega-icon">
                    <s.icon />
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: "block", fontSize: ".9rem" }}>{s.t}</strong>
                    <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>{s.d}</small>
                  </span>
                  {s.done ? <span className="gm-chip"><Check width={13} height={13} /> Done</span> : <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* snapshot */}
      <div className="row g-3 mt-4">
        {[
          { icon: Wheat, label: "Active crops", value: "3", sub: "Cabbage · Maize · Beans" },
          { icon: Wallet, label: "Wallet balance", value: kes(35000), sub: "M-Pesa linked" },
          { icon: ClipboardList, label: "Tasks today", value: "5", sub: "2 urgent" },
          { icon: TrendingUp, label: "Cabbage price", value: "KES 32/head", sub: "Wakulima · rising" },
        ].map((s, i) => (
          <div key={s.label} className="col-6 col-lg-3">
            <Reveal delay={i * 0.06}>
              <div className="gm-card p-3 h-100">
                <span className="gm-mega-icon mb-2">
                  <s.icon />
                </span>
                <strong className="font-display" style={{ display: "block", fontSize: "1.3rem" }}>{s.value}</strong>
                <small style={{ fontWeight: 800, color: "var(--gm-leaf-700)" }}>{s.label}</small>
                <br />
                <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>{s.sub}</small>
              </div>
            </Reveal>
          </div>
        ))}
      </div>

      {/* module map */}
      <Reveal>
        <h2 className="gm-h-section mt-5 mb-1">Your 25 modules</h2>
        <p className="gm-lead">Each page ships one by one. Badges flip from Soon to live automatically.</p>
      </Reveal>
      <div className="gm-module-grid mt-3">
        {modules.map((m, i) => (
          <Reveal key={m.to} delay={Math.min(i * 0.02, 0.4)}>
            <div className="gm-module" title={m.ready ? m.label : `${m.label} — coming soon`}>
              <span className="gm-mega-icon">
                <m.icon />
              </span>
              <strong>{m.label}</strong>
              <small>{m.desc}</small>
              {m.ready ? <span className="gm-chip">Live</span> : <span className="gm-chip gm-chip-gold">Soon</span>}
            </div>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <Reveal>
        <div className="gm-cta-band mt-5 text-center">
          <h2 className="font-display" style={{ color: "#fff" }}>New here? Tour the platform first</h2>
          <p style={{ color: "rgba(255,255,255,.85)" }}>See what each module does before its page ships.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
            <Link to="/services" className="gm-btn gm-btn-lime">
              Explore services <ArrowRight />
            </Link>
            <Link to="/shop" className="gm-btn gm-btn-ghost">
              <Store /> Shop inputs
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
