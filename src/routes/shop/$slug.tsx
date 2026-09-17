import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Minus, Package, Plus, ShieldCheck, ShoppingBasket, Store, Truck } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "../../components/ui/cards";
import { Reveal, Stars } from "../../components/ui/primitives";
import { PRODUCTS, kes } from "../../data/site";
import { useCart } from "../../store/cart";

export const Route = createFileRoute("/shop/$slug")({ component: ProductDetailPage });

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return (
      <main className="gm-section">
        <div className="gm-container" style={{ maxWidth: 640 }}>
          <div className="gm-empty">
            <h2 className="font-display">Product not found</h2>
            <p className="text-muted">It may be out of season. Browse what's in stock:</p>
            <Link to="/shop" className="gm-btn mt-2"><ArrowLeft /> Back to shop</Link>
          </div>
        </div>
      </main>
    );
  }

  const related = PRODUCTS.filter((p) => p.slug !== slug && p.category === product.category)
    .concat(PRODUCTS.filter((p) => p.slug !== slug && p.category !== product.category))
    .slice(0, 4);

  return (
    <main>
      <section className="gm-page-hero">
        <div className="gm-container gm-page-hero-inner" style={{ paddingBottom: "2rem" }}>
          <nav className="gm-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight />
            <Link to="/shop">Shop</Link> <ChevronRight />
            <span className="here">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="gm-section">
        <div className="gm-container">
          <div className="gm-detail-grid">
            {/* art */}
            <Reveal variant="left">
              <div className="gm-detail-art" style={{ background: product.hue }}>
                {product.badge && (
                  <span className={`gm-product-badge ${product.sale ? "sale" : ""}`} style={{ top: "1.2rem", left: "1.2rem" }}>
                    {product.badge}
                  </span>
                )}
                <product.icon />
              </div>
            </Reveal>

            {/* info */}
            <div>
              <Reveal>
                <span className="gm-chip">{product.category} · {product.swahili}</span>
                <h1 className="font-display mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>{product.name}</h1>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <Stars rating={product.rating} size={16} />
                  <strong>{product.rating}</strong>
                  <span style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>· {product.reviews.toLocaleString()} farmer reviews</span>
                </div>
                <p className="gm-lead mt-3">{product.blurb}</p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="gm-price-row" style={{ marginTop: "1.2rem" }}>
                  <span className="gm-price" style={{ fontSize: "2rem" }}>{kes(product.price)}</span>
                  {product.oldPrice && <span className="gm-price-old" style={{ fontSize: "1.05rem" }}>{kes(product.oldPrice)}</span>}
                </div>
                <small className="gm-price-unit">{product.unit} · VAT incl.</small>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                  <span className="gm-qty">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus width={16} height={16} /></button>
                    <strong>{qty}</strong>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label="Increase quantity"><Plus width={16} height={16} /></button>
                  </span>
                  <button className="gm-btn" style={{ flex: "1 1 200px" }} onClick={() => cart.add(product.slug, qty)}>
                    <ShoppingBasket /> Add to basket · {kes(product.price * qty)}
                  </button>
                </div>
                <button
                  className="gm-btn gm-btn-mpesa gm-btn-block mt-2"
                  onClick={() => {
                    cart.add(product.slug, qty);
                    cart.notify("M-Pesa push sent — enter PIN to complete");
                  }}
                >
                  Buy now with M-Pesa <ArrowRight />
                </button>
                <p className="mt-2 mb-0" style={{ fontSize: ".82rem", fontWeight: 700, color: product.stock > 20 ? "var(--gm-leaf-700)" : "var(--gm-clay-500)" }}>
                  {product.stock > 20 ? `✓ In stock — ${product.stock} units at Nairobi hub` : `⚠ Only ${product.stock} left — order soon`}
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-4">
                  <div className="gm-spec"><Truck /> <span>Delivery</span> <strong>Agrovet pickup free · Farm 1–3 days</strong></div>
                  <div className="gm-spec"><ShieldCheck /> <span>Authenticity</span> <strong>KEPHIS / KEBS verified</strong></div>
                  <div className="gm-spec"><Package /> <span>Returns</span> <strong>7-day unopened returns</strong></div>
                  <div className="gm-spec" style={{ border: "none" }}><Store /> <span>Also at</span> <strong>2,000+ partner agrovets</strong></div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="gm-card p-4 mt-3">
                  <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Why farmers love it</h3>
                  <ul className="gm-check-list mb-0">
                    {product.features.map((f) => (
                      <li key={f}><Check /> {f}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>

          {/* related */}
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mt-5 mb-4">
            <h2 className="gm-h-section mb-0">Frequently bought together</h2>
            <Link to="/shop" className="gm-link-arrow">All products <ArrowRight /></Link>
          </div>
          <div className="row g-4">
            {related.map((p, i) => (
              <div key={p.slug} className="col-sm-6 col-lg-3">
                <ProductCard product={p} delay={i * 0.07} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
