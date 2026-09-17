import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

/* ---------- Scroll reveal wrapper ---------- */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  variant?: "up" | "left" | "right" | "zoom";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls =
    variant === "left" ? "gm-reveal-l" : variant === "right" ? "gm-reveal-r" : variant === "zoom" ? "gm-reveal-zoom" : "gm-reveal";

  return (
    <div
      ref={ref}
      className={`${cls} ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--gm-d": `${delay}s`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <Reveal>
      <div
        style={{
          textAlign: align,
          maxWidth: align === "center" ? 680 : undefined,
          margin: align === "center" ? "0 auto 2.6rem" : "0 0 2rem",
        }}
      >
        <span className={`gm-eyebrow ${dark ? "on-dark" : ""}`}>
          <span className="dot" />
          {eyebrow}
        </span>
        <h2 className="gm-h-section" style={dark ? { color: "#fff" } : undefined}>
          {title}
        </h2>
        {sub && <p className={`gm-lead ${dark ? "on-dark" : ""}`}>{sub}</p>}
      </div>
    </Reveal>
  );
}

/* ---------- Stars ---------- */
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="gm-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} width={size} height={size} className={i <= Math.round(rating) ? "" : "off"} />
      ))}
    </span>
  );
}

/* ---------- Advanced pagination with ellipsis + prev/next ---------- */
export function Pagination({
  page,
  total,
  onChange,
  perPage,
  totalItems,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
  perPage?: number;
  totalItems?: number;
}) {
  if (total <= 1) return null;

  const items: (number | "…")[] = [];
  const window = 1;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - window && i <= page + window)) {
      items.push(i);
    } else if (items[items.length - 1] !== "…") {
      items.push("…");
    }
  }

  const from = perPage && totalItems ? (page - 1) * perPage + 1 : 0;
  const to = perPage && totalItems ? Math.min(page * perPage, totalItems) : 0;

  return (
    <div>
      <div className="gm-pagination" role="navigation" aria-label="Pagination">
        <button className="gm-page-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft /> <span className="d-none d-sm-inline">Prev</span>
        </button>
        {items.map((it, idx) =>
          it === "…" ? (
            <span key={`e${idx}`} className="gm-page-dots">
              …
            </span>
          ) : (
            <button
              key={it}
              className={`gm-page-btn ${it === page ? "is-active" : ""}`}
              onClick={() => onChange(it)}
              aria-current={it === page ? "page" : undefined}
            >
              {it}
            </button>
          ),
        )}
        <button
          className="gm-page-btn"
          disabled={page === total}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <span className="d-none d-sm-inline">Next</span> <ChevronRight />
        </button>
      </div>
      {perPage && totalItems ? (
        <p className="gm-page-meta">
          Showing {from}–{to} of {totalItems} · Page {page} of {total}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Animated counter ---------- */
export function CountUp({ value, display }: { value: number; display: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const dur = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - (1 - p) ** 3;
      setCurrent(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value]);

  const formatted =
    value >= 1000 ? `${Math.round(current / 100) / 10}K+`.replace(".0K", "K") : `${current}${display.replace(/[0-9K+.%]/g, "") || ""}`;
  void display;
  return <span ref={ref}>{started ? formatted : "0"}</span>;
}
