import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { kes, type Product, type Service } from "../../data/site";
import { useCart } from "../../store/cart";
import { Reveal, Stars } from "./primitives";

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-100">
      <article className="gm-card gm-service">
        <div className="gm-service-icon">
          <service.icon />
        </div>
        <span className="gm-chip mb-2" style={{ alignSelf: "flex-start" }}>
          {service.category}
        </span>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <div className="gm-service-foot">
          <Link to="/services/$slug" params={{ slug: service.slug }} className="gm-link-arrow">
            Explore <ArrowRight />
          </Link>
          <small style={{ fontWeight: 800, color: "var(--gm-gold-600)", fontSize: ".75rem" }}>
            {service.priceHint.split("·")[0]}
          </small>
        </div>
      </article>
    </Reveal>
  );
}

export function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const cart = useCart();
  return (
    <Reveal delay={delay} className="h-100">
      <article className="gm-card gm-product">
        <Link
          to="/shop/$slug"
          params={{ slug: product.slug }}
          className="gm-product-art"
          style={{ background: product.hue }}
          aria-label={product.name}
        >
          {product.badge && (
            <span className={`gm-product-badge ${product.sale ? "sale" : ""}`}>{product.badge}</span>
          )}
          <product.icon />
        </Link>
        <div className="gm-product-body">
          <span className="gm-product-cat">
            {product.category} · {product.swahili}
          </span>
          <Link
            to="/shop/$slug"
            params={{ slug: product.slug }}
            style={{ color: "inherit" }}
          >
            <h3>{product.name}</h3>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
            <Stars rating={product.rating} />
            <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>
              {product.rating} ({product.reviews.toLocaleString()})
            </small>
          </div>
          <div className="gm-price-row">
            <span className="gm-price">{kes(product.price)}</span>
            {product.oldPrice && <span className="gm-price-old">{kes(product.oldPrice)}</span>}
          </div>
          <small className="gm-price-unit" style={{ marginTop: "-.7rem", marginBottom: ".9rem" }}>
            {product.unit} · {product.stock} in stock
          </small>
          <div style={{ display: "flex", gap: ".5rem", marginTop: "auto" }}>
            <button className="gm-btn gm-btn-sm" style={{ flex: 1 }} onClick={() => cart.add(product.slug)}>
              <Plus /> Add
            </button>
            <Link
              to="/shop/$slug"
              params={{ slug: product.slug }}
              className="gm-btn gm-btn-outline gm-btn-sm"
              aria-label={`View ${product.name}`}
            >
              <ArrowRight />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
