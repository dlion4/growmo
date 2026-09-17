import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  CloudSun,
  FlaskConical,
  Leaf,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Store,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS, SERVICES, kes } from "../../../data/site";
import { useCart } from "../../../store/cart";

/* ================= Shared logo (also used by Footer) ================= */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="gm-logo" aria-label="GrowMO home">
      <span className="gm-logo-mark">
        <Leaf />
      </span>
      <span className="gm-logo-text">
        <strong style={dark ? { color: "#fff" } : undefined}>
          Grow<em>MO</em>
        </strong>
        <small style={dark ? { color: "rgba(255,255,255,.55)" } : undefined}>Smart Farming KE</small>
      </span>
    </Link>
  );
}

/* ================= Mega-menu content ================= */
interface MegaLink {
  icon: typeof Sprout;
  title: string;
  desc: string;
  to: string;
  params?: Record<string, string>;
}

interface MegaMenu {
  id: string;
  label: string;
  hot?: string;
  links: MegaLink[];
  feature: { eyebrow: string; title: string; desc: string; cta: string; to: string };
}

const MENUS: MegaMenu[] = [
  {
    id: "services",
    label: "Services",
    links: [
      { icon: Sprout, title: "Crop Planning", desc: "AEZ-tuned varieties + season plans", to: "/services/$slug", params: { slug: "crop-planning" } },
      { icon: Bot, title: "AI Farm Advisor", desc: "Photo diagnosis + 7-day forecasts", to: "/services/$slug", params: { slug: "ai-advisor" } },
      { icon: CloudSun, title: "Weather Intelligence", desc: "Ward-level rain + planting windows", to: "/services/$slug", params: { slug: "weather-intelligence" } },
      { icon: FlaskConical, title: "Soil Health & Labs", desc: "Sampling kits + fertilizer recipes", to: "/services/$slug", params: { slug: "soil-health" } },
      { icon: Store, title: "Market Linkage", desc: "Live prices + direct buyer orders", to: "/services/$slug", params: { slug: "market-linkage" } },
      { icon: Wallet, title: "Farm Finance", desc: "M-Pesa wallet + per-crop budgets", to: "/services/$slug", params: { slug: "farm-finance" } },
    ],
    feature: {
      eyebrow: "Most loved",
      title: "AI Advisor + Weather bundle",
      desc: "Early pest warnings with exact spray recipes. Farmers report 2× yields.",
      cta: "Explore all 8 services",
      to: "/services",
    },
  },
  {
    id: "shop",
    label: "Shop",
    hot: "Deals",
    links: [
      { icon: Sprout, title: "Certified Seeds", desc: "Gloria F1, H6213, Rosecoco + more", to: "/shop", params: undefined },
      { icon: ShoppingBasket, title: "Fertilizer", desc: "CAN, DAP + Black Gold compost", to: "/shop", params: undefined },
      { icon: ShieldCheck, title: "Crop Protection", desc: "Mancozeb, neem + spray gear", to: "/shop", params: undefined },
      { icon: Truck, title: "Irrigation", desc: "Drip kits + solar pumps", to: "/shop", params: undefined },
      { icon: BadgeCheck, title: "Soil Test Kits", desc: "Lab results in 5–7 days", to: "/shop", params: undefined },
      { icon: TrendingUp, title: "Storage & Tools", desc: "Hermetic bags, sprayers + more", to: "/shop", params: undefined },
    ],
    feature: {
      eyebrow: "This week",
      title: "Short-rains input deals",
      desc: "Up to KES 2,400 off drip kits. M-Pesa checkout + agrovet pickup.",
      cta: "Shop all inputs",
      to: "/shop",
    },
  },
  {
    id: "platform",
    label: "Platform",
    links: [
      { icon: Users, title: "Labour & Payroll", desc: "Schedule, track + bulk M-Pesa pay", to: "/services/$slug", params: { slug: "labour-management" } },
      { icon: BadgeCheck, title: "Traceability", desc: "QR batches + KS1758 certification", to: "/services/$slug", params: { slug: "traceability" } },
      { icon: Wallet, title: "Wallet & Payments", desc: "Auto-categorized farm banking", to: "/services/$slug", params: { slug: "farm-finance" } },
      { icon: Store, title: "Buyer Orders", desc: "Shareable harvest portfolios", to: "/services/$slug", params: { slug: "market-linkage" } },
      { icon: Bot, title: "AI Predictions", desc: "Yield, price + outbreak models", to: "/services/$slug", params: { slug: "ai-advisor" } },
      { icon: CloudSun, title: "Climate Data", desc: "47 counties, ward precision", to: "/services/$slug", params: { slug: "weather-intelligence" } },
    ],
    feature: {
      eyebrow: "28 modules",
      title: "One app, whole farm",
      desc: "From soil test to supermarket shelf — mapped in our platform blueprint.",
      cta: "See how it works",
      to: "/about",
    },
  },
  {
    id: "company",
    label: "Company",
    links: [
      { icon: Leaf, title: "About GrowMO", desc: "Mission, impact + county coverage", to: "/about", params: undefined },
      { icon: Phone, title: "Contact & Support", desc: "Helpline, WhatsApp + agrovets", to: "/contact", params: undefined },
      { icon: Users, title: "For Cooperatives", desc: "200-member group workspaces", to: "/contact", params: undefined },
      { icon: Store, title: "Become an Agrovet", desc: "Join 2,000+ pickup partners", to: "/contact", params: undefined },
      { icon: Truck, title: "Delivery Network", desc: "County pickup + farm delivery", to: "/shop", params: undefined },
      { icon: ShieldCheck, title: "Trust & Safety", desc: "Data protection + guarantees", to: "/about", params: undefined },
    ],
    feature: {
      eyebrow: "Karibu",
      title: "Talk to a real agronomist",
      desc: "Free 10-minute call in English, Kiswahili, Kikuyu, Luo or Kalenjin.",
      cta: "Contact us",
      to: "/contact",
    },
  },
];

/* ================= Header ================= */
export default function Header() {
  const { pathname } = useLocation();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>("services");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"EN" | "SW">("EN");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close everything on route change */
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [pathname]);

  /* escape closes overlays */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
        setSearchOpen(false);
        cart.closeCart();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart]);

  /* lock body scroll when overlays open */
  useEffect(() => {
    const locked = mobileOpen || searchOpen || cart.isOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen, cart.isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { services: [], products: [] };
    return {
      services: SERVICES.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      ).slice(0, 4),
      products: PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.swahili.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      ).slice(0, 4),
    };
  }, [query]);

  const activeMenu = MENUS.find((m) => m.id === openMenu);
  const isActive = (prefix: string) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`);

  return (
    <>
      {/* ---------- announcement bar ---------- */}
      <div className="gm-announce">
        <div className="gm-container gm-announce-inner">
          <p className="gm-announce-msg mb-0">
            <CloudSun />
            <span className="txt">
              {lang === "EN"
                ? "Short rains are active — get your planting plan + input deals before prices rise."
                : "Mvua za vuli zimeanza — pata mpango wa kupanda + ofa za pembejeo kabla bei hazijapanda."}
            </span>
          </p>
          <div className="gm-announce-links">
            <a href="tel:0800221000" className="hide-sm">
              <Phone /> 0800 221 000
            </a>
            <Link to="/shop" className="hide-sm">
              Agrovet pickup <ArrowUpRight width={14} height={14} />
            </Link>
            <button className="gm-lang-pill" onClick={() => setLang(lang === "EN" ? "SW" : "EN")}>
              {lang === "EN" ? "SW" : "EN"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- main header ---------- */}
      <header
        className={`gm-header ${scrolled ? "is-scrolled" : ""}`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="gm-container gm-header-bar">
          <Logo />

          {/* desktop nav */}
          <nav className="gm-nav" aria-label="Primary">
            <div className="gm-nav-item">
              <Link to="/" className={`gm-nav-link ${isActive("/") ? "is-active" : ""}`}>
                Home
              </Link>
            </div>
            {MENUS.map((m) => (
              <div key={m.id} className={`gm-nav-item ${openMenu === m.id ? "is-open" : ""}`}>
                <button
                  className={`gm-nav-link ${
                    (m.id === "services" && isActive("/services")) || (m.id === "shop" && isActive("/shop"))
                      ? "is-active"
                      : ""
                  }`}
                  onMouseEnter={() => setOpenMenu(m.id)}
                  onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                  aria-expanded={openMenu === m.id}
                >
                  {m.label}
                  {m.hot && <span className="gm-nav-hot">{m.hot}</span>}
                  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            ))}
          </nav>

          {/* actions */}
          <div className="gm-header-actions">
            <button className="gm-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search (Ctrl+K)">
              <Search />
            </button>
            <button className="gm-icon-btn" onClick={cart.openCart} aria-label={`Basket, ${cart.count} items`}>
              <ShoppingBasket />
              {cart.count > 0 && <span className="gm-count">{cart.count}</span>}
            </button>
            <a href="/#pricing" className="gm-btn gm-btn-soft gm-btn-sm gm-signin">
              Pricing
            </a>
            <Link to="/contact" className="gm-btn gm-btn-sm gm-btn-keep">
              Start free <ArrowRight />
            </Link>
            <button
              className="gm-icon-btn gm-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* mega panel */}
        <div className="gm-mega-wrap">
          {activeMenu && (
            <div className="gm-mega is-visible" onMouseEnter={() => setOpenMenu(activeMenu.id)}>
              <div className="gm-mega-inner">
                <div className="gm-mega-grid">
                  {activeMenu.links.map((l) => (
                    <Link
                      key={l.title}
                      to={l.to}
                      params={l.params}
                      className="gm-mega-link"
                      onClick={() => setOpenMenu(null)}
                    >
                      <span className="gm-mega-icon">
                        <l.icon />
                      </span>
                      <span>
                        <strong>{l.title}</strong>
                        <p>{l.desc}</p>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link to={activeMenu.feature.to} className="gm-mega-feature" onClick={() => setOpenMenu(null)}>
                  <span className="gm-chip gm-chip-lime mb-2" style={{ alignSelf: "flex-start" }}>
                    {activeMenu.feature.eyebrow}
                  </span>
                  <h4 className="font-display" style={{ color: "#fff", fontSize: "1.35rem" }}>
                    {activeMenu.feature.title}
                  </h4>
                  <p style={{ color: "rgba(255,255,255,.72)", fontSize: ".88rem" }}>{activeMenu.feature.desc}</p>
                  <span className="gm-link-arrow" style={{ color: "var(--gm-lime-300)" }}>
                    {activeMenu.feature.cta} <ArrowRight />
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ---------- mobile drawer ---------- */}
      <div className={`gm-scrim ${mobileOpen ? "is-visible" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`gm-drawer ${mobileOpen ? "is-visible" : ""}`} aria-label="Mobile menu">
        <div className="gm-drawer-head">
          <Logo dark />
          <button className="gm-icon-btn on-dark" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X />
          </button>
        </div>
        <div className="gm-drawer-body">
          <Link to="/" className="gm-acc-link" style={{ fontWeight: 800, fontSize: "1rem", color: "var(--gm-ink-950)" }}>
            <Leaf /> Home
          </Link>
          {MENUS.map((m) => (
            <div key={m.id} className={`gm-acc ${mobileSection === m.id ? "is-open" : ""}`}>
              <button className="gm-acc-head" onClick={() => setMobileSection(mobileSection === m.id ? null : m.id)}>
                {m.label}
                {m.hot && <span className="gm-nav-hot" style={{ marginLeft: ".5rem" }}>{m.hot}</span>}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "auto" }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="gm-acc-panel">
                <div>
                  {m.links.map((l) => (
                    <Link key={l.title} to={l.to} params={l.params} className="gm-acc-link">
                      <l.icon /> {l.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="gm-drawer-foot">
          <Link to="/contact" className="gm-btn gm-btn-block">
            Start farming free <ArrowRight />
          </Link>
          <a href="tel:0800221000" className="gm-btn gm-btn-outline gm-btn-block gm-btn-sm">
            <Phone /> 0800 221 000 (Free)
          </a>
        </div>
      </aside>

      {/* ---------- search overlay ---------- */}
      <div className={`gm-search ${searchOpen ? "is-visible" : ""}`} onClick={() => setSearchOpen(false)}>
        <div className="gm-search-box" onClick={(e) => e.stopPropagation()}>
          <div className="gm-search-input">
            <Search />
            <input
              autoFocus={searchOpen}
              placeholder="Search services, seeds, fertilizer… (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="gm-icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X />
            </button>
          </div>
          <div className="gm-search-results">
            {query.trim().length < 2 ? (
              <p style={{ padding: "1.4rem", color: "var(--gm-ink-400)", fontWeight: 600, margin: 0 }}>
                Try “soil test”, “drip kit”, “cabbage seeds” or “M-Pesa”…
              </p>
            ) : results.services.length + results.products.length === 0 ? (
              <p style={{ padding: "1.4rem", color: "var(--gm-ink-400)", fontWeight: 600, margin: 0 }}>
                No matches for “{query}”. Try “seeds”, “weather” or “market”.
              </p>
            ) : (
              <>
                {results.services.length > 0 && (
                  <>
                    <div className="gm-search-group">Services</div>
                    {results.services.map((s) => (
                      <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="gm-search-hit">
                        <s.icon width={18} height={18} color="var(--gm-leaf-600)" />
                        {s.name}
                        <small>{s.category}</small>
                      </Link>
                    ))}
                  </>
                )}
                {results.products.length > 0 && (
                  <>
                    <div className="gm-search-group">Shop</div>
                    {results.products.map((p) => (
                      <Link key={p.slug} to="/shop/$slug" params={{ slug: p.slug }} className="gm-search-hit">
                        <p.icon width={18} height={18} color="var(--gm-leaf-600)" />
                        {p.name}
                        <small>{kes(p.price)}</small>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- cart drawer ---------- */}
      <div className={`gm-scrim ${cart.isOpen ? "is-visible" : ""}`} onClick={cart.closeCart} />
      <aside className={`gm-drawer ${cart.isOpen ? "is-visible" : ""}`} aria-label="Shopping basket">
        <div className="gm-drawer-head">
          <strong style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <ShoppingBasket width={20} height={20} /> Your basket ({cart.count})
          </strong>
          <button className="gm-icon-btn on-dark" onClick={cart.closeCart} aria-label="Close basket">
            <X />
          </button>
        </div>
        <div className="gm-drawer-body">
          {cart.lines.length === 0 ? (
            <div className="gm-empty">
              <div className="gm-service-icon">
                <ShoppingBasket />
              </div>
              <h4 className="font-display mt-3">Basket is empty</h4>
              <p className="text-muted">Certified seeds, fertilizer and tools are one tap away.</p>
              <Link to="/shop" className="gm-btn gm-btn-sm mt-2">
                Browse the shop <ArrowRight />
              </Link>
            </div>
          ) : (
            <>
              {cart.lines.map((l) => {
                const p = PRODUCTS.find((x) => x.slug === l.slug);
                if (!p) return null;
                return (
                  <div key={l.slug} className="gm-cart-item">
                    <span className="gm-cart-art" style={{ background: p.hue }}>
                      <p.icon />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: ".86rem", display: "block", lineHeight: 1.35 }}>{p.name}</strong>
                      <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>{kes(p.price)} · {p.unit}</small>
                      <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginTop: ".5rem" }}>
                        <span className="gm-qty" style={{ transform: "scale(.85)", transformOrigin: "left" }}>
                          <button onClick={() => cart.setQty(l.slug, l.qty - 1)} aria-label="Decrease">
                            <Minus width={14} height={14} />
                          </button>
                          <strong>{l.qty}</strong>
                          <button onClick={() => cart.setQty(l.slug, l.qty + 1)} aria-label="Increase">
                            <Plus width={14} height={14} />
                          </button>
                        </span>
                        <button
                          onClick={() => cart.remove(l.slug)}
                          aria-label="Remove item"
                          style={{ border: "none", background: "none", color: "var(--gm-clay-500)", cursor: "pointer", marginLeft: "auto" }}
                        >
                          <Trash2 width={17} height={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={cart.clear}
                style={{ border: "none", background: "none", color: "var(--gm-ink-400)", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", padding: ".4rem 0" }}
              >
                Clear basket
              </button>
            </>
          )}
        </div>
        {cart.lines.length > 0 && (
          <div className="gm-drawer-foot">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span>Subtotal</span>
              <span>{kes(cart.subtotal)}</span>
            </div>
            <small style={{ color: "var(--gm-ink-400)", fontWeight: 600, display: "flex", gap: ".4rem", alignItems: "center" }}>
              <Truck width={15} height={15} /> Free agrovet pickup · Farm delivery from KES 200
            </small>
            <button
              className="gm-btn gm-btn-mpesa gm-btn-block"
              onClick={() => {
                cart.notify("M-Pesa push sent — enter PIN to complete");
                cart.closeCart();
              }}
            >
              Pay with M-Pesa <ArrowRight />
            </button>
            <Link to="/shop" className="gm-btn gm-btn-outline gm-btn-block gm-btn-sm">
              Continue shopping
            </Link>
          </div>
        )}
      </aside>

    </>
  );
}
