import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, LayoutGrid, Search, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { ServiceCard } from "../../components/ui/cards";
import { Pagination, Reveal, SectionHeading } from "../../components/ui/primitives";
import { SERVICE_CATEGORIES, SERVICES } from "../../data/site";

export const Route = createFileRoute("/services/")({ component: ServicesPage });

const PER_PAGE = 6;

function ServicesPage() {
  const [cat, setCat] = useState<(typeof SERVICE_CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SERVICES.filter(
      (s) =>
        (cat === "All" || s.category === cat) &&
        (!query || s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)),
    );
  }, [cat, q]);

  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, total);
  const items = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const pick = (c: typeof cat) => {
    setCat(c);
    setPage(1);
  };

  return (
    <main>
      {/* hero */}
      <section className="gm-page-hero">
        <div className="gm-container gm-page-hero-inner">
          <nav className="gm-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight /> <span className="here">Services</span>
          </nav>
          <Reveal><h1>Everything your shamba needs, in one app</h1></Reveal>
          <Reveal delay={0.1}>
            <p>
              Eight connected services drawn from our 28-module platform blueprint — planning,
              intelligence, markets, money and management. Start with one, grow into all.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <span className="gm-chip gm-chip-lime"><Sprout width={14} height={14} /> 8 services</span>
              <span className="gm-chip gm-chip-ghost">Free tier on all</span>
              <span className="gm-chip gm-chip-ghost">M-Pesa native</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* filters */}
      <section className="gm-section">
        <div className="gm-container">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
            <LayoutGrid width={18} height={18} color="var(--gm-leaf-600)" />
            {SERVICE_CATEGORIES.map((c) => {
              const n = c === "All" ? SERVICES.length : SERVICES.filter((s) => s.category === c).length;
              return (
                <button key={c} className={`gm-filter-chip ${cat === c ? "is-active" : ""}`} onClick={() => pick(c)}>
                  {c} <span className="gm-n">{n}</span>
                </button>
              );
            })}
            <div className="gm-search-field ms-auto" style={{ minWidth: 240, flex: "1 1 240px", maxWidth: 340 }}>
              <Search />
              <input
                className="gm-input"
                placeholder="Search services…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="gm-empty">
              <div className="gm-service-icon"><Search /></div>
              <h4 className="font-display mt-3">No services match “{q}”</h4>
              <p className="text-muted">Try “soil”, “market” or “M-Pesa”.</p>
              <button className="gm-btn gm-btn-outline gm-btn-sm mt-2" onClick={() => { setQ(""); setCat("All"); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {items.map((s, i) => (
                <div key={s.slug} className="col-md-6 col-lg-4">
                  <ServiceCard service={s} delay={(i % 3) * 0.08} />
                </div>
              ))}
            </div>
          )}

          <Pagination page={safePage} total={total} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} perPage={PER_PAGE} totalItems={filtered.length} />
        </div>
      </section>

      {/* cross-link to shop */}
      <section className="gm-section-sm">
        <div className="gm-container">
          <SectionHeading
            eyebrow="Pairs perfectly"
            title="Services plan it. The Shop stocks it."
            sub="Every recommendation links straight to genuine inputs with M-Pesa checkout."
          />
          <Reveal>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/shop" className="gm-btn gm-btn-lg">Browse the shop <ArrowRight /></Link>
              <Link to="/contact" className="gm-btn gm-btn-outline gm-btn-lg">Talk to an agronomist</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
