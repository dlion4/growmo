import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight, Map } from "lucide-react";
import { ServiceCard } from "../../components/ui/cards";
import { Reveal } from "../../components/ui/primitives";
import { SERVICES } from "../../data/site";

export const Route = createFileRoute("/services/$slug")({ component: ServiceDetailPage });

function ServiceDetailPage() {
  const { slug } = Route.useParams();
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return (
      <main className="gm-section">
        <div className="gm-container" style={{ maxWidth: 640 }}>
          <div className="gm-empty">
            <h2 className="font-display">Service not found</h2>
            <p className="text-muted">That page may have moved. Here are all eight GrowMO services:</p>
            <Link to="/services" className="gm-btn mt-2"><ArrowLeft /> All services</Link>
          </div>
        </div>
      </main>
    );
  }

  const related = SERVICES.filter((s) => s.slug !== slug && s.category === service.category)
    .concat(SERVICES.filter((s) => s.slug !== slug && s.category !== service.category))
    .slice(0, 3);

  return (
    <main>
      {/* hero */}
      <section className="gm-page-hero">
        <div className="gm-container gm-page-hero-inner">
          <nav className="gm-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight />
            <Link to="/services">Services</Link> <ChevronRight />
            <span className="here">{service.name}</span>
          </nav>
          <div className="gm-split" style={{ gap: "2rem" }}>
            <div>
              <Reveal>
                <span className="gm-chip gm-chip-lime mb-3">{service.category} · {service.blueprint}</span>
              </Reveal>
              <Reveal delay={0.08}><h1 style={{ maxWidth: "20ch" }}>{service.name}</h1></Reveal>
              <Reveal delay={0.14}>
                <p style={{ fontSize: "1.12rem", color: "var(--gm-lime-300)", fontWeight: 700 }}>{service.tagline}</p>
                <p className="mt-2">{service.description}</p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link to="/contact" className="gm-btn gm-btn-lime">Start free <ArrowRight /></Link>
                  <Link to="/services" className="gm-btn gm-btn-ghost"><ArrowLeft /> All services</Link>
                </div>
              </Reveal>
            </div>
            <Reveal variant="zoom" delay={0.1}>
              <div
                style={{
                  background: service.hue,
                  borderRadius: "var(--gm-r-xl)",
                  minHeight: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "var(--gm-shadow-lg)",
                }}
              >
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.25) 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
                <service.icon width={110} height={110} color="#fff" style={{ position: "relative", filter: "drop-shadow(0 20px 30px rgba(0,0,0,.35))" }} />
                <span className="gm-product-badge" style={{ top: "1.1rem", left: "1.1rem" }}>{service.priceHint.split("·")[0]}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="gm-section-sm">
        <div className="gm-container">
          <div className="row g-3">
            {service.stats.map((s, i) => (
              <div key={s.label} className="col-4">
                <Reveal delay={i * 0.08}>
                  <div className="gm-card text-center p-3 p-md-4">
                    <div className="font-display" style={{ fontSize: "clamp(1.5rem,3.5vw,2.4rem)", fontWeight: 900, color: "var(--gm-leaf-700)" }}>
                      {s.value}
                    </div>
                    <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>{s.label}</small>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* deep dive */}
      <section className="gm-section-sm" style={{ paddingTop: 0 }}>
        <div className="gm-container">
          <div className="gm-split" style={{ alignItems: "start" }}>
            <div>
              <Reveal>
                <span className="gm-eyebrow"><span className="dot" /> Deep dive</span>
                <h2 className="gm-h-section">How {service.name.toLowerCase()} works</h2>
              </Reveal>
              {service.longDescription.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="gm-lead" style={{ fontSize: "1.02rem" }}>{p}</p>
                </Reveal>
              ))}
              <Reveal>
                <p className="gm-check-row mt-3">
                  <span className="gm-mega-icon"><Map /></span>
                  <span>
                    <strong>Blueprint coverage</strong>
                    <small>{service.blueprint} — every workflow specified for Kenyan conditions.</small>
                  </span>
                </p>
              </Reveal>
            </div>
            <div>
              {service.features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.07}>
                  <div className="gm-check-row">
                    <span className="gm-mega-icon"><BadgeCheck /></span>
                    <span>
                      <strong>{f.title}</strong>
                      <small>{f.desc}</small>
                    </span>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={0.3}>
                <div className="gm-card p-4 mt-3" style={{ background: "var(--gm-forest-950)", border: "none" }}>
                  <p className="mb-1" style={{ color: "var(--gm-lime-300)", fontWeight: 800, fontSize: ".8rem", letterSpacing: ".1em" }}>PRICING</p>
                  <p className="font-display" style={{ color: "#fff", fontSize: "1.25rem" }}>{service.priceHint}</p>
                  <Link to="/contact" className="gm-btn gm-btn-lime gm-btn-sm mt-2">
                    Get started <ArrowRight />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* how it flows */}
      <section className="gm-section-sm" style={{ background: "#fff", borderBlock: "1px solid var(--gm-line-soft)" }}>
        <div className="gm-container">
          <Reveal>
            <h2 className="gm-h-section text-center mb-4">Your first week with {service.name.split("&")[0]}</h2>
          </Reveal>
          <div className="row g-3">
            {["Day 1 — Set up in 15 minutes with guided onboarding in your language.", "Day 2 — Your first plan, forecast or recommendation lands automatically.", "Day 7 — Review results with your agronomist call + next-week tasks."].map((t, i) => (
              <div key={t} className="col-md-4">
                <Reveal delay={i * 0.08}>
                  <div className="gm-card p-4 h-100 d-flex gap-3">
                    <span className="gm-step-num" style={{ fontSize: "1.8rem" }}>0{i + 1}</span>
                    <p className="mb-0" style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>{t}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* related */}
      <section className="gm-section">
        <div className="gm-container">
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
            <h2 className="gm-h-section mb-0">Pairs well with</h2>
            <Link to="/services" className="gm-link-arrow">All services <ArrowRight /></Link>
          </div>
          <div className="row g-4">
            {related.map((s, i) => (
              <div key={s.slug} className="col-md-4">
                <ServiceCard service={s} delay={i * 0.08} />
              </div>
            ))}
          </div>
          <Reveal>
            <div className="gm-cta-band mt-5 text-center">
              <h2 className="font-display" style={{ color: "#fff" }}>Ready to try {service.name.split("&")[0]}?</h2>
              <p style={{ color: "rgba(255,255,255,.85)" }}>Free tier · No card · M-Pesa ready · Cancel anytime</p>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                <Link to="/contact" className="gm-btn gm-btn-lime gm-btn-lg">Start free <ArrowRight /></Link>
                <Link to="/shop" className="gm-btn gm-btn-ghost gm-btn-lg"><Check /> Shop matching inputs</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
