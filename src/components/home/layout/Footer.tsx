import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Smartphone,
} from "lucide-react";

/* Inline brand icons (lucide-react no longer ships brand glyphs) */
function BrandSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
const FacebookIcon = () => (
  <BrandSvg>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </BrandSvg>
);
const InstagramIcon = () => (
  <BrandSvg>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </BrandSvg>
);
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L1.5 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7 3.9H5.2L17.8 20z" />
  </svg>
);
const YoutubeIcon = () => (
  <BrandSvg>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </BrandSvg>
);
const LinkedinIcon = () => (
  <BrandSvg>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </BrandSvg>
);
import { useEffect, useState } from "react";
import { PRODUCT_CATEGORIES, SERVICES } from "../../../data/site";
import { Logo } from "./Header";

const SITE_PAGES = [
  { n: "01", label: "Home", to: "/" },
  { n: "02", label: "Services", to: "/services" },
  { n: "03", label: "Shop", to: "/shop" },
  { n: "04", label: "About", to: "/about" },
  { n: "05", label: "Contact", to: "/contact" },
];

const LANGS = [
  { code: "EN", label: "English" },
  { code: "SW", label: "Kiswahili" },
];

export default function Footer() {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANGS[0]);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setLangOpen(false), [pathname]);

  const activeIdx = Math.max(
    0,
    SITE_PAGES.findIndex((p) => (p.to === "/" ? pathname === "/" : pathname.startsWith(p.to))),
  );
  const prev = SITE_PAGES[(activeIdx - 1 + SITE_PAGES.length) % SITE_PAGES.length];
  const next = SITE_PAGES[(activeIdx + 1) % SITE_PAGES.length];

  const activePrefix = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      <footer className="gm-footer">
        <div className="gm-footer-top" />
        <div className="gm-container">
          {/* ---------- main columns ---------- */}
          <div className="gm-footer-main">
            {/* brand */}
            <div className="gm-footer-brand">
              <Logo dark />
              <p>
                Kenya's all-in-one smart farming platform — plan crops, predict pests, track money and sell
                directly to buyers. From soil test to supermarket shelf.
              </p>
              <div className="gm-pay-chips mb-3">
                <span>M-PESA</span>
                <span>AIRTEL</span>
                <span>EQUITY</span>
                <span>VISA</span>
              </div>
              <div className="gm-socials">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon /></a>
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"><XIcon /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><YoutubeIcon /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon /></a>
              </div>
            </div>

            {/* services */}
            <div>
              <h5 className="gm-footer-h">Services</h5>
              <ul className="gm-footer-links">
                {SERVICES.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <Link to="/services/$slug" params={{ slug: s.slug }}>
                      <ArrowRight /> {s.name.split("&")[0]}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/services" style={{ color: "var(--gm-lime-300)", fontWeight: 800 }}>
                    <ArrowRight /> View all 8
                  </Link>
                </li>
              </ul>
            </div>

            {/* shop */}
            <div>
              <h5 className="gm-footer-h">Shop</h5>
              <ul className="gm-footer-links">
                {PRODUCT_CATEGORIES.slice(1, 6).map((c) => (
                  <li key={c}>
                    <Link to="/shop">
                      <ArrowRight /> {c}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/shop" style={{ color: "var(--gm-lime-300)", fontWeight: 800 }}>
                    <ArrowRight /> Today's deals
                  </Link>
                </li>
              </ul>
            </div>

            {/* company */}
            <div>
              <h5 className="gm-footer-h">Company</h5>
              <ul className="gm-footer-links">
                <li><Link to="/about"><ArrowRight /> About GrowMO</Link></li>
                <li><Link to="/contact"><ArrowRight /> Contact & support</Link></li>
                <li><a href="/#platform"><ArrowRight /> Platform tour</a></li>
                <li><a href="/#pricing"><ArrowRight /> Pricing</a></li>
                <li><a href="/#stories"><ArrowRight /> Farmer stories</a></li>
                <li><a href="/#faq"><ArrowRight /> FAQs</a></li>
              </ul>
            </div>

            {/* newsletter + contact */}
            <div>
              <h5 className="gm-footer-h">Mavuno Tips Weekly</h5>
              <p style={{ fontSize: ".86rem", color: "rgba(207,224,212,.7)", margin: 0 }}>
                Prices, rain outlook + one money tip. Every Sunday, free via SMS or email.
              </p>
              {subscribed ? (
                <p className="gm-chip gm-chip-lime mt-3">
                  <Check width={14} height={14} /> Asante! You're on the list.
                </p>
              ) : (
                <form
                  className="gm-news-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.includes("@")) setSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email for newsletter"
                  />
                  <button className="gm-btn gm-btn-lime gm-btn-sm" type="submit" aria-label="Subscribe">
                    <ArrowRight />
                  </button>
                </form>
              )}
              <div style={{ marginTop: "1.2rem" }}>
                <p className="gm-contact-line"><Phone /> 0800 221 000 (Toll-free)</p>
                <p className="gm-contact-line"><MessageCircle /> WhatsApp: 0712 345 678</p>
                <p className="gm-contact-line"><Smartphone /> USSD: *384*66# · SMS: 22100</p>
                <p className="gm-contact-line"><Mail /> hello@growmo.co.ke</p>
                <p className="gm-contact-line"><MapPin /> Westlands, Nairobi · Serving 47 counties</p>
              </div>
            </div>
          </div>

          {/* ---------- advanced site pagination ---------- */}
          <div className="gm-foot-pages" aria-label="Site pages">
            <span className="gm-cap">Explore pages</span>
            <Link
              to={prev.to}
              className="gm-foot-page"
              aria-label={`Previous page: ${prev.label}`}
              title={`Previous: ${prev.label}`}
            >
              <ChevronLeft width={15} height={15} /> Prev
            </Link>
            {SITE_PAGES.map((p) => (
              <Link key={p.n} to={p.to} className={`gm-foot-page ${activePrefix(p.to) ? "is-active" : ""}`}>
                <span className="gm-pn">{p.n}</span> {p.label}
              </Link>
            ))}
            <Link
              to={next.to}
              className="gm-foot-page"
              aria-label={`Next page: ${next.label}`}
              title={`Next: ${next.label}`}
            >
              Next <ChevronRight width={15} height={15} />
            </Link>

            {/* language dropdown */}
            <div className={`gm-dropdown ${langOpen ? "is-open" : ""}`} style={{ marginLeft: "auto" }}>
              <button
                className="gm-foot-page"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-label="Choose language"
                type="button"
              >
                <span className="gm-pn">{lang.code}</span> {lang.label}
                <ChevronDown width={15} height={15} />
              </button>
              <div className="gm-dropdown-menu" style={{ bottom: "calc(100% + 8px)", top: "auto" }}>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`gm-dropdown-item ${l.code === lang.code ? "is-active" : ""}`}
                    onClick={() => {
                      setLang(l);
                      setLangOpen(false);
                    }}
                  >
                    {l.code === lang.code && <Check width={15} height={15} />}
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- bottom bar ---------- */}
          <div className="gm-footer-bottom">
            <span>© {year} GrowMO Ltd · Nairobi, Kenya · Built for the hands that feed the nation 🌾</span>
            <nav>
              <Link to="/about">Privacy</Link>
              <Link to="/about">Terms</Link>
              <Link to="/about">Data Protection</Link>
              <span style={{ color: "rgba(207,224,212,.35)" }}>KES · EN</span>
            </nav>
          </div>
        </div>
      </footer>

      {/* back to top */}
      <button
        className={`gm-to-top ${showTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUp />
      </button>
    </>
  );
}
