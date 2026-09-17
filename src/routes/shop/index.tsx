import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Search, ShieldCheck, ShoppingBasket, SlidersHorizontal, Truck, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "../../components/ui/cards";
import { Pagination, Reveal } from "../../components/ui/primitives";
import { PRODUCT_CATEGORIES, PRODUCTS } from "../../data/site";

export const Route = createFileRoute("/shop/")({ component: ShopPage });

const PER_PAGE = 8;
type Sort = "featured" | "low" | "high" | "rating";

function ShopPage() {
  const [cat, setCat] = useState<(typeof PRODUCT_CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = PRODUCTS.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (!query ||
          p.name.toLowerCase().includes(query) ||
          p.swahili.toLowerCase().includes(query) ||
          p.blurb.toLowerCase().includes(query)),
    );
    switch (sort) {
      case "low":
        return [...list].sort((a, b) => a.price - b.price);
      case "high":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      default:
        return list;
    }
  }, [cat, q, sort]);

  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, total);
  const items = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const reset = (c: typeof cat) => {
    setCat(c);
    setPage(1);
  };

  return (
    <main>
      {/* hero */}
      <section className="gm-page-hero">
        <div className="gm-container gm-page-hero-inner">
          <nav className="gm-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight /> <span className="here">Shop</span>
          </nav>
          <Reveal><h1>Genuine farm inputs, delivered to your shamba</h1></Reveal>
          <Reveal delay={0.1}>
            <p>
              KEPHIS + KEBS certified seeds, fertilizer, drip kits and tools — with M-Pesa checkout,
              free agrovet pickup and agronomist advice on every order.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <span className="gm-chip gm-chip-lime"><Truck width={14} height={14} /> Free agrovet pickup</span>
              <span className="gm-chip gm-chip-ghost"><ShieldCheck width={14} height={14} /> 100% genuine guarantee</span>
              <span className="gm-chip gm-chip-ghost"><Wallet width={14} height={14} /> M-Pesa checkout</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="gm-section">
        <div className="gm-container">
          <div className="row g-4">
            {/* sidebar */}
            <aside className="col-lg-3">
              <Reveal variant="left">
                <div className="gm-card p-4" style={{ position: "sticky", top: "calc(var(--gm-header-h) + 1rem)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, display: "flex", gap: ".5rem", alignItems: "center" }}>
                    <SlidersHorizontal width={17} height={17} color="var(--gm-leaf-600)" /> Categories
                  </h3>
                  <div className="d-grid gap-2 mt-3">
                    {PRODUCT_CATEGORIES.map((c) => {
                      const n = c === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c).length;
                      return (
                        <button
                          key={c}
                          className={`gm-filter-chip justify-content-between ${cat === c ? "is-active" : ""}`}
                          onClick={() => reset(c)}
                          style={{ width: "100%" }}
                        >
                          {c} <span className="gm-n">{n}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="gm-card p-3 mt-4" style={{ background: "var(--gm-mint-50)" }}>
                    <small style={{ fontWeight: 800, color: "var(--gm-leaf-700)" }}>NOT SURE WHAT YOU NEED?</small>
                    <p className="mb-2 mt-1" style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--gm-ink-600)" }}>
                      Get a free input list from your season plan.
                    </p>
                    <Link to="/services" className="gm-link-arrow" style={{ fontSize: ".85rem" }}>
                      Plan my season <ArrowRight />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </aside>

            {/* listing */}
            <div className="col-lg-9">
              <Reveal>
                <div className="gm-card p-3 mb-4 d-flex flex-wrap gap-2 align-items-center">
                  <div className="gm-search-field" style={{ flex: "1 1 220px" }}>
                    <Search />
                    <input
                      className="gm-input"
                      placeholder="Search seeds, fertilizer, drip kits…"
                      value={q}
                      onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <select
                    className="gm-select"
                    style={{ width: "auto", borderRadius: "var(--gm-r-pill)" }}
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value as Sort);
                      setPage(1);
                    }}
                    aria-label="Sort products"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="low">Price: Low → High</option>
                    <option value="high">Price: High → Low</option>
                    <option value="rating">Top rated</option>
                  </select>
                </div>
              </Reveal>

              <p style={{ fontWeight: 700, color: "var(--gm-ink-400)", fontSize: ".88rem" }}>
                {filtered.length} product{filtered.length === 1 ? "" : "s"}
                {cat !== "All" && <> in <strong style={{ color: "var(--gm-leaf-700)" }}>{cat}</strong></>}
                {q && <> matching “{q}”</>}
              </p>

              {items.length === 0 ? (
                <div className="gm-empty">
                  <div className="gm-service-icon"><ShoppingBasket /></div>
                  <h4 className="font-display mt-3">Nothing found</h4>
                  <p className="text-muted">Try “seeds”, “CAN” or “drip”.</p>
                  <button className="gm-btn gm-btn-outline gm-btn-sm mt-2" onClick={() => { setQ(""); reset("All"); setSort("featured"); }}>
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {items.map((p, i) => (
                    <div key={p.slug} className="col-sm-6 col-xl-4">
                      <ProductCard product={p} delay={(i % 3) * 0.07} />
                    </div>
                  ))}
                </div>
              )}

              <Pagination page={safePage} total={total} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} perPage={PER_PAGE} totalItems={filtered.length} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
