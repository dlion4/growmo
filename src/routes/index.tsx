import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Droplets,
  FlaskConical,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Smartphone,
  Sprout,
  Star,
  Store,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { useRef, useState } from "react";
import { ProductCard, ServiceCard } from "../components/ui/cards";
import { CountUp, Reveal, SectionHeading, Stars } from "../components/ui/primitives";
import {
  FAQS,
  MARKET_TICKER,
  PLATFORM_TABS,
  PRICING,
  PRODUCTS,
  SERVICES,
  STATS,
  TESTIMONIALS,
} from "../data/site";
import { useCart } from "../store/cart";

export const Route = createFileRoute("/")({ component: HomePage });

const AVATARS = [
  { i: "WJ", bg: "linear-gradient(135deg,#166534,#4cc38a)" },
  { i: "KB", bg: "linear-gradient(135deg,#b45309,#fbbf24)" },
  { i: "AO", bg: "linear-gradient(135deg,#9a3412,#fdba74)" },
  { i: "GA", bg: "linear-gradient(135deg,#0e7490,#67e8f9)" },
  { i: "+", bg: "linear-gradient(135deg,#22a355,#d8f65f)" },
];

function HomePage() {
  const cart = useCart();
  const [tab, setTab] = useState(PLATFORM_TABS[0]);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const quoteRef = useRef<HTMLDivElement>(null);

  const scrollQuotes = (dir: 1 | -1) => {
    quoteRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <main>
      {/* ================= 1. HERO ================= */}
      <section className="gm-hero">
        <div className="gm-hero-blob b1" />
        <div className="gm-hero-blob b2" />
        <div className="gm-container gm-hero-grid">
          <div className="gm-hero-copy">
            <Reveal>
              <p className="gm-kicker">
                <Sprout width={15} height={15} /> Kenya's #1 smart-farming platform · 128K+ farmers
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="gm-h-display" style={{ color: "#fff" }}>
                Farm smarter.
                <br />
                <span className="gm-grad-text">Harvest more.</span>
                <br />
                Earn bigger.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="gm-lead on-dark mt-3" style={{ maxWidth: "52ch" }}>
                GrowMO plans your season, predicts pests, tracks every shilling on M-Pesa and connects
                you straight to buyers — from soil test to supermarket shelf, in all 47 counties.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="gm-hero-ctas">
                <Link to="/contact" className="gm-btn gm-btn-lime gm-btn-lg">
                  Start farming free <ArrowRight />
                </Link>
                <Link to="/services" className="gm-btn gm-btn-ghost gm-btn-lg">
                  Explore services
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="gm-hero-proof">
                <div className="gm-avatars">
                  {AVATARS.map((a) => (
                    <span key={a.i} style={{ background: a.bg }}>
                      {a.i}
                    </span>
                  ))}
                </div>
                <div>
                  <Stars rating={5} size={15} />
                  <p className="mb-0 mt-1" style={{ fontSize: ".85rem", fontWeight: 700, color: "rgba(255,255,255,.8)" }}>
                    4.9/5 from 21,000+ farmer reviews
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="gm-hero-stats">
                <div><strong>2×</strong><small>Avg. yield lift</small></div>
                <div><strong>+18%</strong><small>Better sale prices</small></div>
                <div><strong>−30%</strong><small>Wasted inputs</small></div>
              </div>
            </Reveal>
          </div>

          {/* hero visual */}
          <Reveal variant="right" delay={0.15} className="gm-hero-visual">
            <div className="gm-float-card gm-float-1">
              <span className="gm-mega-icon" style={{ background: "rgba(124,58,237,.12)", color: "#7c3aed" }}>
                <Bot />
              </span>
              <span>
                <strong>Black-rot risk 82%</strong>
                <small>Spray Mancozeb within 48h</small>
              </span>
            </div>
            <div className="gm-dash">
              <div className="gm-dash-top">
                <i style={{ background: "#f87171" }} />
                <i style={{ background: "#fbbf24" }} />
                <i style={{ background: "#4ade80" }} />
                <span style={{ marginLeft: ".6rem", fontSize: ".75rem", fontWeight: 800, color: "#9fb3a6" }}>
                  app.growmo.co.ke
                </span>
              </div>
              <div className="gm-dash-body">
                <div style={{ display: "flex", alignItems: "center", gap: ".8rem", marginBottom: "1rem" }}>
                  <span className="gm-mega-icon"><CloudSun /></span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: ".9rem" }}>Githunguri, Kiambu · 24°C</strong>
                    <div style={{ height: 8, borderRadius: 99, background: "var(--gm-mint-100)", marginTop: ".4rem", overflow: "hidden" }}>
                      <div style={{ width: "70%", height: "100%", borderRadius: 99, background: "var(--gm-grad-primary)" }} />
                    </div>
                  </div>
                  <span className="gm-chip">70% rain</span>
                </div>
                <div style={{ border: "1px solid var(--gm-line-soft)", borderRadius: 16, padding: ".9rem 1rem", marginBottom: ".8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: ".88rem" }}>🥬 Cabbage · Gloria F1</strong>
                    <span className="gm-chip">Day 24/90</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 99, background: "var(--gm-mint-100)", marginTop: ".6rem", overflow: "hidden" }}>
                    <div style={{ width: "27%", height: "100%", borderRadius: 99, background: "var(--gm-grad-primary)" }} />
                  </div>
                  <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>Next: Top-dress CAN · in 3 days</small>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
                  <div style={{ background: "var(--gm-mint-50)", borderRadius: 14, padding: ".8rem .9rem" }}>
                    <small style={{ fontWeight: 800, color: "var(--gm-leaf-700)", fontSize: ".7rem" }}>WALLET</small>
                    <strong style={{ display: "block", fontSize: "1.05rem" }}>KES 35,000</strong>
                  </div>
                  <div style={{ background: "#fff8ec", border: "1px solid #f3e2b8", borderRadius: 14, padding: ".8rem .9rem" }}>
                    <small style={{ fontWeight: 800, color: "var(--gm-gold-600)", fontSize: ".7rem" }}>HARVEST VALUE</small>
                    <strong style={{ display: "block", fontSize: "1.05rem" }}>KES 224,000</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="gm-float-card gm-float-2">
              <span className="gm-mega-icon"><Wallet /></span>
              <span>
                <strong>+KES 12,400</strong>
                <small>Buyer paid · M-Pesa ✓</small>
              </span>
            </div>
            <div className="gm-float-card gm-float-3">
              <span className="gm-mega-icon" style={{ background: "rgba(2,132,199,.12)", color: "#0284c7" }}>
                <Droplets />
              </span>
              <span>
                <strong>Planting window open</strong>
                <small>Best week: Oct 20 – 27</small>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 2. MARKET TICKER ================= */}
      <div className="gm-ticker" aria-label="Live market prices">
        <div className="gm-marquee">
          {[...MARKET_TICKER, ...MARKET_TICKER].map((m, i) => (
            <span key={i}>
              {m.trend === "up" ? <TrendingUp /> : <TrendingDown />}
              {m.crop} · {m.price} · {m.market}
            </span>
          ))}
        </div>
      </div>

      {/* ================= 3. TRUST STRIP ================= */}
      <section className="gm-section-sm">
        <div className="gm-container">
          <Reveal>
            <p className="text-center mb-2" style={{ fontSize: ".78rem", fontWeight: 800, letterSpacing: ".18em", color: "var(--gm-ink-400)" }}>
              TRUSTED ACROSS KENYA'S FOOD CHAIN
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="gm-strip">
              <span className="gm-strip-brand"><Smartphone /> Safaricom M-Pesa</span>
              <span className="gm-strip-brand"><FlaskConical /> KALRO Labs</span>
              <span className="gm-strip-brand"><BadgeCheck /> KEPHIS Certified</span>
              <span className="gm-strip-brand"><Banknote /> Equity Bank</span>
              <span className="gm-strip-brand"><MapPin /> 47 County Govts</span>
              <span className="gm-strip-brand"><Store /> 2,000+ Agrovets</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 4. SERVICES ================= */}
      <section className="gm-section" style={{ paddingTop: "1.5rem" }}>
        <div className="gm-container">
          <SectionHeading
            eyebrow="What GrowMO does"
            title={<>Eight services. <span className="gm-grad-text-green">One thriving farm.</span></>}
            sub="Every module talks to each other — your soil test shapes your fertilizer plan, which shapes your budget, which shapes your market timing."
          />
          <div className="row g-4">
            {SERVICES.map((s, i) => (
              <div key={s.slug} className="col-md-6 col-lg-3">
                <ServiceCard service={s} delay={(i % 4) * 0.08} />
              </div>
            ))}
          </div>
          <Reveal>
            <div className="text-center mt-5">
              <Link to="/services" className="gm-btn gm-btn-dark gm-btn-lg">
                Compare all services <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 5. STAT BAND ================= */}
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

      {/* ================= 6. PLATFORM TABS ================= */}
      <section className="gm-section" id="platform" style={{ background: "var(--gm-grad-mist)", borderRadius: "var(--gm-r-xl)" }}>
        <div className="gm-container">
          <SectionHeading
            eyebrow="Platform tour"
            title="See the engine room"
            sub="Four pillars carry your whole season. Tap through to feel how GrowMO thinks."
          />
          <Reveal>
            <div className="gm-tabs" role="tablist">
              {PLATFORM_TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab.id === t.id}
                  className={`gm-tab ${tab.id === t.id ? "is-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  <t.icon /> {t.label}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal variant="zoom">
            <div className="gm-tabpanel">
              <div className="gm-tabpanel-copy">
                <h3 className="font-display" style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)" }}>{tab.title}</h3>
                <p className="gm-lead mt-2">{tab.desc}</p>
                <ul className="gm-check-list">
                  {tab.points.map((p) => (
                    <li key={p}><Check /> {p}</li>
                  ))}
                </ul>
                <div>
                  <Link to="/services" className="gm-btn">
                    Try it free <ArrowRight />
                  </Link>
                </div>
              </div>
              <div className="gm-tabpanel-art" style={{ background: tab.hue }}>
                <div style={{ textAlign: "center", position: "relative", zIndex: 1, color: "#fff", padding: "2rem" }}>
                  <tab.icon width={72} height={72} style={{ filter: "drop-shadow(0 16px 24px rgba(0,0,0,.3))" }} />
                  <div className="font-display" style={{ fontSize: "3.4rem", fontWeight: 900, lineHeight: 1, marginTop: "1rem" }}>
                    {tab.stat}
                  </div>
                  <div style={{ fontWeight: 800, opacity: 0.9 }}>{tab.statLabel}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 7. HOW IT WORKS ================= */}
      <section className="gm-section" id="how">
        <div className="gm-container">
          <SectionHeading
            eyebrow="From signup to sale"
            title="Live in one afternoon"
            sub="No training needed. If you can use M-Pesa, you can run GrowMO."
          />
          <div className="row g-4">
            {[
              { n: "01", t: "Tell us your shamba", d: "Pin your plots on satellite map, add soil + water details. Takes 15 minutes with our Swahili guides." },
              { n: "02", t: "Get your season plan", d: "Varieties ranked by profit, planting dates, fertilizer + spray calendars and a full M-Pesa budget." },
              { n: "03", t: "Grow with AI guards", d: "Daily tasks, ward weather alerts and 7-day pest warnings keep every crop on track." },
              { n: "04", t: "Sell + get paid", d: "List your harvest, take buyer orders and receive M-Pesa — with QR traceability included." },
            ].map((s, i) => (
              <div key={s.n} className="col-md-6 col-lg-3">
                <Reveal delay={i * 0.08} className="h-100">
                  <article className="gm-card gm-step">
                    <span className="gm-step-num">{s.n}</span>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{s.t}</h3>
                      <p className="mb-0" style={{ fontSize: ".88rem", color: "var(--gm-ink-600)", lineHeight: 1.65 }}>{s.d}</p>
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 8. SHOP PREVIEW ================= */}
      <section className="gm-section" style={{ background: "#fff", borderBlock: "1px solid var(--gm-line-soft)" }}>
        <div className="gm-container">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <SectionHeading
              align="left"
              eyebrow="GrowMO Shop"
              title={<>Genuine inputs, <span className="gm-grad-text-green">delivered.</span></>}
              sub="KEPHIS + KEBS certified stock with M-Pesa checkout and agrovet pickup countrywide."
            />
            <Reveal>
              <Link to="/shop" className="gm-btn gm-btn-outline mb-4">
                Visit the shop <ArrowRight />
              </Link>
            </Reveal>
          </div>
          <div className="row g-4">
            {PRODUCTS.slice(0, 4).map((p, i) => (
              <div key={p.slug} className="col-sm-6 col-lg-3">
                <ProductCard product={p} delay={i * 0.08} />
              </div>
            ))}
          </div>
          <Reveal>
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-5">
              <span className="gm-chip"><Truck width={14} height={14} /> Free agrovet pickup</span>
              <span className="gm-chip"><ShieldCheck width={14} height={14} /> 100% genuine guarantee</span>
              <span className="gm-chip"><Wallet width={14} height={14} /> M-Pesa + Airtel accepted</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 9. AI / WEATHER BANNER ================= */}
      <section className="gm-section">
        <div className="gm-container">
          <Reveal variant="zoom">
            <div className="gm-stat-band" style={{ background: "linear-gradient(135deg,#0c2317,#17522f 55%,#1d8345)" }}>
              <div className="gm-split">
                <div>
                  <span className="gm-eyebrow on-dark"><span className="dot" /> Climate intelligence</span>
                  <h2 className="gm-h-section" style={{ color: "#fff" }}>
                    Never lose a crop to surprise weather again
                  </h2>
                  <p className="gm-lead on-dark">
                    Ward-level rain forecasts fused with your crop stage — translated into plain tasks:
                    when to spray, when to plant, when to hold.
                  </p>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <span className="gm-chip gm-chip-lime"><Bell width={14} height={14} /> Storm SMS alerts</span>
                    <span className="gm-chip gm-chip-lime"><CloudSun width={14} height={14} /> 7-day field forecast</span>
                    <span className="gm-chip gm-chip-lime"><Bot width={14} height={14} /> Disease-risk engine</span>
                  </div>
                  <div className="mt-4">
                    <Link to="/services/$slug" params={{ slug: "weather-intelligence" }} className="gm-btn gm-btn-lime">
                      See weather intelligence <ArrowRight />
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="gm-card p-4" style={{ background: "rgba(255,255,255,.97)" }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <span className="gm-service-icon mb-0"><CloudSun /></span>
                      <div>
                        <strong>Short rains · Week 3</strong>
                        <br />
                        <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>Githunguri ward forecast</small>
                      </div>
                    </div>
                    {[
                      { d: "Today", t: "22°C · Heavy rain", w: "90%", c: "var(--gm-grad-primary)" },
                      { d: "Tomorrow", t: "21°C · Showers", w: "65%", c: "linear-gradient(90deg,#0284c7,#7dd3fc)" },
                      { d: "Thursday", t: "23°C · Partly cloudy", w: "25%", c: "var(--gm-grad-gold)" },
                    ].map((r) => (
                      <div key={r.d} className="d-flex align-items-center gap-3 mb-2">
                        <small style={{ width: 74, fontWeight: 800 }}>{r.d}</small>
                        <div style={{ flex: 1, height: 12, borderRadius: 99, background: "var(--gm-mint-100)", overflow: "hidden" }}>
                          <div style={{ width: r.w, height: "100%", borderRadius: 99, background: r.c }} />
                        </div>
                        <small style={{ width: 130, fontWeight: 700, color: "var(--gm-ink-400)", textAlign: "right" }}>{r.t}</small>
                      </div>
                    ))}
                    <p className="gm-check-row mt-3 mb-0" style={{ background: "var(--gm-mint-50)" }}>
                      <span className="gm-mega-icon"><Bot /></span>
                      <span>
                        <strong>AI advice</strong>
                        <small>Hold foliar spray today — rain washes it off. Spray Thursday 7am.</small>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 10. TESTIMONIALS ================= */}
      <section className="gm-section" id="stories" style={{ paddingTop: "1rem" }}>
        <div className="gm-container">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <SectionHeading
              align="left"
              eyebrow="Farmer stories"
              title="Real shambas. Real money."
              sub="From Kiambu cabbage to Makueni mangoes — hear it from the hands that feed Kenya."
            />
            <Reveal>
              <div className="gm-carousel-nav mb-4">
                <button className="gm-icon-btn" onClick={() => scrollQuotes(-1)} aria-label="Previous stories">
                  <ChevronLeft />
                </button>
                <button className="gm-icon-btn" onClick={() => scrollQuotes(1)} aria-label="Next stories">
                  <ChevronRight />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="gm-container">
          <div
            ref={quoteRef}
            className="d-flex gap-4 pb-2"
            style={{ overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
          >
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className="gm-card gm-quote" style={{ minWidth: 340, maxWidth: 340, scrollSnapAlign: "start" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="gm-quote-mark"><Star /></span>
                  <Stars rating={t.rating} />
                </div>
                <p>“{t.quote}”</p>
                <span className="gm-chip" style={{ alignSelf: "flex-start" }}><TrendingUp width={14} height={14} /> {t.result}</span>
                <div className="gm-quote-who">
                  <span className="gm-quote-ava" style={{ background: t.hue }}>{t.initials}</span>
                  <span>
                    <strong style={{ display: "block", fontSize: ".92rem" }}>{t.name}</strong>
                    <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>{t.role} · {t.county}</small>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 11. PRICING ================= */}
      <section className="gm-section" id="pricing" style={{ background: "var(--gm-forest-950)", borderRadius: "var(--gm-r-xl)" }}>
        <div className="gm-container">
          <SectionHeading
            dark
            eyebrow="Simple pricing"
            title="Start free. Scale with harvest."
            sub="One better-timed spray pays for a year of Premium. Cancel anytime, keep your data."
          />
          <div className="row g-4">
            {PRICING.map((p, i) => (
              <div key={p.name} className="col-md-4">
                <Reveal delay={i * 0.1} className="h-100">
                  <article className={`gm-card gm-pricing ${p.popular ? "popular" : ""}`}>
                    {p.popular && (
                      <span className="gm-chip gm-chip-gold mb-2" style={{ alignSelf: "flex-start" }}>
                        <Star width={14} height={14} /> Most popular
                      </span>
                    )}
                    <h3 className="font-display" style={{ fontSize: "1.3rem" }}>{p.name}</h3>
                    <p style={{ fontSize: ".88rem", color: "var(--gm-ink-600)" }}>{p.desc}</p>
                    <div className="mt-2">
                      <span className="gm-price-big">{p.price}</span>
                      <span style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>{p.period}</span>
                    </div>
                    <ul className="gm-check-list">
                      {p.features.map((f) => (
                        <li key={f}><Check /> {f}</li>
                      ))}
                    </ul>
                    <Link to="/contact" className={`gm-btn gm-btn-block ${p.popular ? "" : "gm-btn-outline"}`}>
                      {p.cta} <ArrowRight />
                    </Link>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 12. APP / USSD BAND ================= */}
      <section className="gm-section">
        <div className="gm-container">
          <Reveal variant="zoom">
            <div className="gm-app-band p-4 p-md-5">
              <div className="gm-split" style={{ position: "relative", zIndex: 1 }}>
                <div>
                  <span className="gm-eyebrow on-dark"><span className="dot" /> Works on every phone</span>
                  <h2 className="gm-h-section" style={{ color: "#fff" }}>Kabambe? Smartphone? Karibu wote.</h2>
                  <p className="gm-lead on-dark">
                    Full app for smartphones, USSD + SMS for kabambe, and 2,000+ agrovet agents for
                    face-to-face help. No farmer left behind.
                  </p>
                  <div className="row g-3 mt-3">
                    <div className="col-sm-6">
                      <div className="gm-ussd-card">
                        <small style={{ fontWeight: 800, color: "rgba(255,255,255,.6)" }}>USSD · ANY PHONE</small>
                        <div className="gm-ussd-code">*384*66#</div>
                        <small style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>Prices, weather, tasks</small>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="gm-ussd-card">
                        <small style={{ fontWeight: 800, color: "rgba(255,255,255,.6)" }}>SMS ALERTS</small>
                        <div className="gm-ussd-code">Send START to 22100</div>
                        <small style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>Storm + price warnings</small>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <button className="gm-btn gm-btn-ghost" onClick={() => cart.notify("Android app — coming to Play Store soon")}>
                      <Smartphone /> Android app
                    </button>
                    <a className="gm-btn gm-btn-ghost" href="tel:0800221000">
                      <Phone /> 0800 221 000
                    </a>
                    <Link to="/contact" className="gm-btn gm-btn-lime">
                      <MessageCircle /> WhatsApp us
                    </Link>
                  </div>
                </div>
                {/* CSS phone mock */}
                <div className="d-flex justify-content-center">
                  <div style={{ width: 250, borderRadius: 38, background: "#fff", padding: 12, boxShadow: "0 40px 80px -20px rgba(0,0,0,.5)" }}>
                    <div style={{ background: "var(--gm-forest-950)", borderRadius: 26, padding: "1rem .9rem", color: "#fff" }}>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span style={{ width: 34, height: 34, borderRadius: 11, background: "var(--gm-grad-lime)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Leaf width={18} height={18} color="#0c2317" />
                        </span>
                        <strong style={{ fontSize: ".85rem" }}>Habari, Mary 👋</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 14, padding: ".7rem .8rem", marginBottom: ".6rem" }}>
                        <small style={{ color: "var(--gm-lime-300)", fontWeight: 800, fontSize: ".68rem" }}>TODAY · 3 TASKS</small>
                        <div style={{ fontSize: ".78rem", fontWeight: 700, marginTop: ".2rem" }}>☑ Scout Diamondback moth</div>
                        <div style={{ fontSize: ".78rem", fontWeight: 700 }}>☐ Spray Mancozeb 10am</div>
                      </div>
                      <div style={{ background: "var(--gm-grad-lime)", borderRadius: 14, padding: ".7rem .8rem", color: "#0c2317" }}>
                        <small style={{ fontWeight: 800, fontSize: ".68rem" }}>WALLET</small>
                        <strong style={{ display: "block" }}>KES 35,000</strong>
                      </div>
                      <div className="d-flex gap-2 mt-2">
                        <span className="gm-chip-ghost gm-chip" style={{ flex: 1, justifyContent: "center", fontSize: ".68rem" }}><Plus width={12} height={12} /> Task</span>
                        <span className="gm-chip-ghost gm-chip" style={{ flex: 1, justifyContent: "center", fontSize: ".68rem" }}><Bot width={12} height={12} /> Ask AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 13. FAQ ================= */}
      <section className="gm-section" id="faq" style={{ paddingTop: "1rem" }}>
        <div className="gm-container" style={{ maxWidth: 860 }}>
          <SectionHeading
            eyebrow="Maswali? Majibu."
            title="Questions farmers ask"
            sub="Still curious? Call 0800 221 000 — a real agronomist picks up."
          />
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i * 0.05, 0.3)}>
              <div className={`gm-faq ${faqOpen === i ? "is-open" : ""}`}>
                <button className="gm-faq-head" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {f.q}
                  <span className="gm-faq-plus"><Plus /></span>
                </button>
                <div className="gm-faq-body">
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= 14. FINAL CTA ================= */}
      <section className="gm-section-sm">
        <div className="gm-container">
          <Reveal variant="zoom">
            <div className="gm-cta-band text-center">
              <span className="gm-chip" style={{ background: "rgba(255,255,255,.16)", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
                <Sprout width={14} height={14} /> Short-rains season is open
              </span>
              <h2 className="font-display mt-3" style={{ color: "#fff", fontSize: "clamp(1.9rem,4.5vw,3rem)" }}>
                Your best harvest starts this week.
              </h2>
              <p className="mx-auto" style={{ color: "rgba(255,255,255,.85)", maxWidth: "56ch", fontSize: "1.05rem" }}>
                Join 128,000+ Kenyan farmers planning, protecting and profiting with GrowMO.
                Free to start — your first season plan in 3 minutes.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                <Link to="/contact" className="gm-btn gm-btn-lime gm-btn-lg">
                  Get my free season plan <ArrowRight />
                </Link>
                <Link to="/shop" className="gm-btn gm-btn-ghost gm-btn-lg">
                  <Store /> Shop inputs
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
