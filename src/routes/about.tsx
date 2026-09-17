import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Heart, Leaf, MapPin, ShieldCheck, Sprout, Users } from "lucide-react";
import { CountUp, Reveal, SectionHeading } from "../components/ui/primitives";
import { STATS } from "../data/site";

export const Route = createFileRoute("/about")({ component: AboutPage });

const VALUES = [
  { icon: Heart, title: "Farmers first, always", desc: "Every feature is tested on real shambas in real rains — if it doesn't raise income, we don't ship it." },
  { icon: Users, title: "No farmer left behind", desc: "Smartphone app, kabambe USSD, SMS alerts and 2,000+ human agents. Technology adapts to farmers, not vice versa." },
  { icon: ShieldCheck, title: "Trust is the product", desc: "Genuine inputs guaranteed, transparent prices, Kenya Data Protection Act compliance and farmer-owned data." },
  { icon: Sprout, title: "Soil before software", desc: "Built with KALRO scientists and county extension officers. Agronomy leads, AI follows." },
];

const TIMELINE = [
  { year: "2023", title: "Planted in Kiambu", desc: "500 pilot farmers test crop plans + SMS weather alerts. 94% report higher income." },
  { year: "2024", title: "M-Pesa + markets go live", desc: "Wallet, buyer portfolios and 12 market feeds launch. 30,000 farmers join." },
  { year: "2025", title: "AI Advisor + soil labs", desc: "Photo diagnosis, 7-day pest forecasts and 12 partner labs across 47 counties." },
  { year: "2026", title: "128,000 farmers strong", desc: "Full 28-module blueprint live. Cooperatives, exporters and agrovets run on GrowMO." },
];

const TEAM = [
  { i: "DN", name: "David Njoroge", role: "Founder & CEO", bg: "linear-gradient(135deg,#166534,#4cc38a)", note: "3rd-gen Kiambu farmer, ex-M-Pesa product" },
  { i: "FK", name: "Faith Kiprop", role: "Head of Agronomy", bg: "linear-gradient(135deg,#b45309,#fbbf24)", note: "Ex-KALRO, 15 yrs extension" },
  { i: "OO", name: "Otieno Ochieng", role: "CTO", bg: "linear-gradient(135deg,#1e3a8a,#60a5fa)", note: "Offline-first systems, USSD at scale" },
  { i: "WM", name: "Wanjiru Mwangi", role: "Head of Markets", bg: "linear-gradient(135deg,#9a3412,#fdba74)", note: "Built Wakulima price network" },
];

function AboutPage() {
  return (
    <main>
      <section className="gm-page-hero">
        <div className="gm-container gm-page-hero-inner">
          <nav className="gm-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight /> <span className="here">About</span>
          </nav>
          <Reveal><h1>Built for the hands that feed Kenya</h1></Reveal>
          <Reveal delay={0.1}>
            <p>
              GrowMO started on a half-acre in Kiambu with one question: why does the farmer —
              who takes all the risk — earn the least? We're fixing that with planning,
              predictions and direct market power.
            </p>
          </Reveal>
        </div>
      </section>

      {/* story + values */}
      <section className="gm-section">
        <div className="gm-container gm-split" style={{ alignItems: "start" }}>
          <div>
            <Reveal>
              <span className="gm-eyebrow"><span className="dot" /> Our story</span>
              <h2 className="gm-h-section">From one shamba to 47 counties</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="gm-lead" style={{ fontSize: "1.02rem" }}>
                In 2023, our founder watched his mother's cabbage fetch KES 12 a head from a broker —
                then sell for KES 45 in Wakulima the same day. The problem wasn't farming. It was
                information: no prices, no forecasts, no records, no bargaining power.
              </p>
              <p className="gm-lead" style={{ fontSize: "1.02rem" }}>
                GrowMO now packs a full extension office, agrovet, bank and marketplace into one
                platform — specified across a 28-module blueprint covering soil, seed, labour,
                money, markets and everything between.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <span className="gm-chip"><MapPin width={14} height={14} /> HQ: Westlands, Nairobi</span>
                <span className="gm-chip"><Leaf width={14} height={14} /> Field hubs in 12 counties</span>
              </div>
            </Reveal>
          </div>
          <div>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="gm-check-row">
                  <span className="gm-mega-icon"><v.icon /></span>
                  <span><strong>{v.title}</strong><small>{v.desc}</small></span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="gm-section-sm" style={{ paddingTop: 0 }}>
        <div className="gm-container">
          <Reveal variant="zoom">
            <div className="gm-stat-band">
              <div className="gm-stat-grid">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <strong><CountUp value={s.value} display={s.display} /></strong>
                    <small>{s.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* timeline */}
      <section className="gm-section">
        <div className="gm-container">
          <SectionHeading eyebrow="The journey" title="Four seasons of growth" />
          <div className="row g-4">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="col-md-6 col-lg-3">
                <Reveal delay={i * 0.08} className="h-100">
                  <article className="gm-card p-4 h-100">
                    <span className="gm-chip gm-chip-gold">{t.year}</span>
                    <h3 className="font-display mt-3" style={{ fontSize: "1.25rem" }}>{t.title}</h3>
                    <p className="mb-0" style={{ fontSize: ".9rem", color: "var(--gm-ink-600)", lineHeight: 1.65 }}>{t.desc}</p>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* team */}
      <section className="gm-section" style={{ background: "#fff", borderBlock: "1px solid var(--gm-line-soft)" }}>
        <div className="gm-container">
          <SectionHeading
            eyebrow="Leadership"
            title="Farmers, scientists, builders"
            sub="A team that splits time between Nairobi HQ and county field days."
          />
          <div className="row g-4">
            {TEAM.map((m, i) => (
              <div key={m.name} className="col-sm-6 col-lg-3">
                <Reveal delay={i * 0.08} className="h-100">
                  <article className="gm-card gm-quote" style={{ alignItems: "center", textAlign: "center" }}>
                    <span className="gm-quote-ava" style={{ background: m.bg, width: 72, height: 72, fontSize: "1.4rem" }}>{m.i}</span>
                    <div>
                      <strong style={{ fontSize: "1.05rem" }}>{m.name}</strong>
                      <br />
                      <small style={{ fontWeight: 800, color: "var(--gm-leaf-700)" }}>{m.role}</small>
                      <p className="mb-0 mt-2" style={{ fontSize: ".84rem", color: "var(--gm-ink-400)", fontWeight: 600 }}>{m.note}</p>
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
          <Reveal>
            <div className="gm-cta-band mt-5 text-center">
              <h2 className="font-display" style={{ color: "#fff" }}>Come grow with us</h2>
              <p style={{ color: "rgba(255,255,255,.85)" }}>Farmers, agrovets, cooperatives and county partners — karibu.</p>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                <Link to="/contact" className="gm-btn gm-btn-lime gm-btn-lg">Get in touch <ArrowRight /></Link>
                <Link to="/services" className="gm-btn gm-btn-ghost gm-btn-lg">Explore services</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
