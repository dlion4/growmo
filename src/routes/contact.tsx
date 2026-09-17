import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone, Send, Smartphone, Store } from "lucide-react";
import { useState } from "react";
import { Reveal } from "../components/ui/primitives";
import { COUNTIES_SAMPLE } from "../data/site";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", county: "", topic: "Get my free season plan", message: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <main>
      <section className="gm-page-hero">
        <div className="gm-container gm-page-hero-inner">
          <nav className="gm-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <ChevronRight /> <span className="here">Contact</span>
          </nav>
          <Reveal><h1>Talk to a real agronomist</h1></Reveal>
          <Reveal delay={0.1}>
            <p>
              Free 10-minute onboarding call in English, Kiswahili, Kikuyu, Luo or Kalenjin.
              Or reach us on helpline, WhatsApp, SMS — even *384*66#.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="gm-section">
        <div className="gm-container">
          <div className="row g-4" style={{ alignItems: "start" }}>
            {/* form */}
            <div className="col-lg-7">
              <Reveal variant="left">
                <div className="gm-card p-4 p-md-5">
                  {sent ? (
                    <div className="text-center py-4">
                      <span className="gm-service-icon mx-auto" style={{ background: "var(--gm-grad-primary)", color: "#fff", width: 72, height: 72 }}>
                        <Check width={34} height={34} />
                      </span>
                      <h2 className="font-display mt-3">Asante, {form.name.split(" ")[0] || "mkulima"}!</h2>
                      <p className="gm-lead">
                        An agronomist will call <strong>{form.phone}</strong> within 2 working hours
                        (Mon–Sat, 7am–7pm). Meanwhile, your free season plan is being prepared.
                      </p>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                        <Link to="/services" className="gm-btn">Explore services <ArrowRight /></Link>
                        <button className="gm-btn gm-btn-outline" onClick={() => setSent(false)}>Send another message</button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSent(true);
                      }}
                    >
                      <h2 className="font-display" style={{ fontSize: "1.6rem" }}>Get your free season plan</h2>
                      <p className="text-muted" style={{ fontWeight: 600, fontSize: ".92rem" }}>
                        Tell us about your shamba — we reply within 2 working hours.
                      </p>
                      <div className="row g-3 mt-1">
                        <div className="col-md-6">
                          <div className="gm-field">
                            <label htmlFor="c-name">Full name</label>
                            <input id="c-name" className="gm-input" required placeholder="e.g. Mary Wanjiku" value={form.name} onChange={set("name")} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="gm-field">
                            <label htmlFor="c-phone">Phone (M-Pesa)</label>
                            <input id="c-phone" className="gm-input" required placeholder="07XX XXX XXX" pattern="0[17][0-9]{8}" title="Enter a valid Kenyan number like 0712345678" value={form.phone} onChange={set("phone")} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="gm-field">
                            <label htmlFor="c-county">County</label>
                            <select id="c-county" className="gm-select" value={form.county} onChange={set("county")}>
                              <option value="">Select county…</option>
                              {COUNTIES_SAMPLE.map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                              <option>Another county</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="gm-field">
                            <label htmlFor="c-topic">I want to…</label>
                            <select id="c-topic" className="gm-select" value={form.topic} onChange={set("topic")}>
                              <option>Get my free season plan</option>
                              <option>Order inputs / soil kit</option>
                              <option>Sell my harvest</option>
                              <option>Join as cooperative</option>
                              <option>Become an agrovet partner</option>
                              <option>Something else</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="gm-field">
                            <label htmlFor="c-msg">Tell us about your farm</label>
                            <textarea
                              id="c-msg"
                              className="gm-textarea"
                              placeholder="e.g. 2 acres in Nakuru, maize + beans, borehole water…"
                              value={form.message}
                              onChange={set("message")}
                            />
                          </div>
                        </div>
                      </div>
                      <button className="gm-btn gm-btn-lg" type="submit" style={{ width: "100%" }}>
                        <Send /> Request my free plan
                      </button>
                      <p className="text-center mt-2 mb-0" style={{ fontSize: ".8rem", color: "var(--gm-ink-400)", fontWeight: 600 }}>
                        No spam, ever. Your data is protected under Kenya's Data Protection Act.
                      </p>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>

            {/* info */}
            <div className="col-lg-5">
              <Reveal variant="right">
                <div className="gm-card p-4" style={{ background: "var(--gm-forest-950)", border: "none", color: "#fff" }}>
                  <h3 className="font-display" style={{ color: "#fff", fontSize: "1.3rem" }}>Reach us directly</h3>
                  <div className="d-grid gap-2 mt-3">
                    <a href="tel:0800221000" className="gm-ussd-card d-flex align-items-center gap-3" style={{ color: "#fff" }}>
                      <Phone width={22} height={22} color="var(--gm-lime-300)" />
                      <span><strong>0800 221 000</strong><br /><small style={{ color: "rgba(255,255,255,.65)" }}>Toll-free helpline · Mon–Sat 7am–7pm</small></span>
                    </a>
                    <a href="https://wa.me/254712345678" target="_blank" rel="noreferrer" className="gm-ussd-card d-flex align-items-center gap-3" style={{ color: "#fff" }}>
                      <MessageCircle width={22} height={22} color="var(--gm-lime-300)" />
                      <span><strong>WhatsApp: 0712 345 678</strong><br /><small style={{ color: "rgba(255,255,255,.65)" }}>Chat + send crop photos</small></span>
                    </a>
                    <div className="gm-ussd-card d-flex align-items-center gap-3">
                      <Smartphone width={22} height={22} color="var(--gm-lime-300)" />
                      <span><strong className="gm-ussd-code">*384*66#</strong><br /><small style={{ color: "rgba(255,255,255,.65)" }}>USSD on any phone · SMS 22100</small></span>
                    </div>
                    <a href="mailto:hello@growmo.co.ke" className="gm-ussd-card d-flex align-items-center gap-3" style={{ color: "#fff" }}>
                      <Mail width={22} height={22} color="var(--gm-lime-300)" />
                      <span><strong>hello@growmo.co.ke</strong><br /><small style={{ color: "rgba(255,255,255,.65)" }}>Replies within 1 working day</small></span>
                    </a>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-4" style={{ color: "rgba(255,255,255,.7)", fontSize: ".86rem", fontWeight: 600 }}>
                    <MapPin width={17} height={17} color="var(--gm-lime-300)" /> Green House, Westlands, Nairobi
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-2" style={{ color: "rgba(255,255,255,.7)", fontSize: ".86rem", fontWeight: 600 }}>
                    <Clock width={17} height={17} color="var(--gm-lime-300)" /> Field hubs in 12 counties
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="gm-card p-4 mt-4">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, display: "flex", gap: ".5rem", alignItems: "center" }}>
                    <Store width={19} height={19} color="var(--gm-leaf-600)" /> Own an agrovet?
                  </h3>
                  <p className="mb-3" style={{ fontSize: ".9rem", color: "var(--gm-ink-600)" }}>
                    Join 2,000+ pickup partners earning commission on every order, soil kit and farmer signup.
                  </p>
                  <button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => { setForm({ ...form, topic: "Become an agrovet partner" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    Apply as partner <ArrowRight />
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
