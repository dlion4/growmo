import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, LifeBuoy, Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { AUTH_NAV } from "../../data/auth";
import { Logo } from "../home/layout/Header";

/* ================= Minimal auth topbar (replaces marketing header on /auth/*) ================= */
export function AuthTopbar() {
  return (
    <div className="gm-auth-top">
      <div className="gm-container gm-auth-top-inner">
        <Logo />
        <span className="gm-chip hide-sm" style={{ fontSize: ".74rem" }}>
          <Lock width={13} height={13} /> 256-bit encrypted · Data Protection Act compliant
        </span>
        <div style={{ display: "flex", gap: ".5rem", marginLeft: "auto" }}>
          <Link to="/contact" className="gm-btn gm-btn-soft gm-btn-sm hide-sm">
            <LifeBuoy width={15} height={15} /> Help
          </Link>
          <Link to="/" className="gm-btn gm-btn-outline gm-btn-sm">
            <ArrowLeft width={15} height={15} /> Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AuthMiniFooter() {
  return (
    <footer className="gm-auth-foot">
      <div className="gm-container gm-auth-foot-inner">
        <span>© {new Date().getFullYear()} GrowMO Ltd · Nairobi</span>
        <nav>
          <Link to="/about">Privacy</Link>
          <Link to="/about">Terms</Link>
          <Link to="/contact">Support: 0800 221 000</Link>
        </nav>
        <span className="gm-chip" style={{ fontSize: ".72rem" }}>
          <ShieldCheck width={13} height={13} /> Never share OTPs or PINs
        </span>
      </div>
    </footer>
  );
}

/* ================= Split layout (login, register, recovery, mfa, identity) ================= */
export function AuthSplit({
  eyebrow,
  title,
  intro,
  points,
  quote,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  quote: { text: string; who: string };
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="gm-auth-wrap">
      <div className={`gm-container gm-auth-split ${wide ? "is-wide" : ""}`}>
        {/* brand panel */}
        <aside className="gm-auth-panel">
          <div className="gm-auth-panel-blob b1" />
          <div className="gm-auth-panel-blob b2" />
          <div className="gm-auth-panel-inner">
            <span className="gm-eyebrow on-dark">
              <span className="dot" /> {eyebrow}
            </span>
            <h1 className="font-display">{title}</h1>
            <p>{intro}</p>
            <ul className="gm-auth-points">
              {points.map((p) => (
                <li key={p}>
                  <Check /> {p}
                </li>
              ))}
            </ul>
            <figure className="gm-auth-quote">
              <blockquote>“{quote.text}”</blockquote>
              <figcaption>— {quote.who}</figcaption>
            </figure>
          </div>
        </aside>

        {/* form side */}
        <div className="gm-auth-main">{children}</div>
      </div>
    </div>
  );
}

/* ================= Console layout (passkeys, security, account-status, hub) ================= */
export function AuthConsole({
  title,
  desc,
  children,
  actions,
}: {
  title: string;
  desc: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="gm-auth-wrap">
      <div className="gm-container gm-console">
        <aside className="gm-console-side">
          <p className="gm-console-side-cap">Account & access</p>
          <nav className="gm-side-nav" aria-label="Auth sections">
            {AUTH_NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <button
                  key={n.to}
                  type="button"
                  className={`gm-side-link ${active ? "is-active" : ""}`}
                  onClick={() => navigate({ to: n.to })}
                >
                  <span className="gm-side-icon">
                    <n.icon />
                  </span>
                  <span className="gm-side-text">
                    <strong>{n.label}</strong>
                    <small>{n.desc}</small>
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="gm-console-side-card">
            <ShieldCheck width={20} height={20} />
            <p>
              <strong>Locked out?</strong>
              <span>Call 0800 221 000 with your ID number ready.</span>
            </p>
          </div>
        </aside>

        <div className="gm-console-main">
          <div className="gm-console-head">
            <div>
              <h1 className="font-display">{title}</h1>
              <p>{desc}</p>
            </div>
            {actions && <div className="gm-console-actions">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
