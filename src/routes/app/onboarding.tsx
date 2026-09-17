import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Building2, Camera, Check, CheckCircle2,
  ChevronLeft, ChevronRight, ClipboardList, CloudSun, Copy, Download, FlaskConical,
  History, Info, KeyRound, Landmark, Leaf, ListChecks, LocateFixed, Lock, MapPin, Navigation, Pencil,
  Phone, Plus, Printer, RefreshCw, RotateCcw, Save, Search, ShieldCheck, Smartphone, Sprout,
  Star, Target, Tractor, Trash2, TriangleAlert, Upload, Users, Wallet, X,
} from "lucide-react";
import { Dialog, OtpInput, PinPad, ScoreRing, Toggle, useCountdown } from "../../components/auth/controls";
import { Reveal } from "../../components/ui/primitives";
import { useToast } from "../../store/toast";
import { kes } from "../../data/site";
import {
  AEZ_CROPS, AEZ_ZONES, ALL_COUNTIES, ASSET_CATALOG, BANKS, CERTS, CHALLENGES,
  CONDITIONS, COUNTIES_DETAILED, CROP_LIBRARY, CROP_SEASONS, DRAFT_PROFILE, FARMER_GROUPS, GENDERS,
  GOALS, IRRIGATION_TYPES, LABOUR_MODELS, LAND_USES, LANGUAGES, LIVESTOCK_BREEDS, LITERACY_LEVELS,
  MARKET_PREFS, ORGANIC_OPTS, RISKS, ROAD_ACCESS, SLOPES, SOIL_TYPES, WATER_SOURCES,
  classifyAEZ,
} from "../../data/app/onboarding";
import type { AssetRow, FarmProfile, LivestockRow, Plot, SeasonRow } from "../../data/app/onboarding";

export const Route = createFileRoute("/app/onboarding")({ component: OnboardingPage });

const uid = () => Math.random().toString(36).slice(2, 9);
const DRAFT_KEY = "growmo.onboarding.v1";

const STEP_DEFS = [
  { icon: Phone, t: "Phone", d: "Verify number" },
  { icon: ShieldCheck, t: "Identity", d: "KYC details" },
  { icon: MapPin, t: "Location", d: "Farm + plots" },
  { icon: FlaskConical, t: "Soil & water", d: "Per plot" },
  { icon: Tractor, t: "Assets", d: "Equipment" },
  { icon: History, t: "History", d: "Past seasons" },
  { icon: Target, t: "Goals", d: "Plans" },
  { icon: Wallet, t: "M-Pesa", d: "Money" },
];

/* ================= completeness ================= */
function stepScores(p: FarmProfile): number[] {
  const s0 = p.phoneVerified ? 100 : p.phone ? 30 : 0;
  const id = [p.name, p.idNumber.replace(/\D/g, "").length >= 7, p.altPhone, p.email, p.dob, p.gender, p.language, p.literacy, p.photo].filter(Boolean).length;
  const s1 = Math.round((id / 9) * 100);
  const loc = [p.farmName, p.county, p.sub, p.ward, p.village, p.gps, p.plots.length > 0].filter(Boolean).length;
  const s2 = Math.round((loc / 7) * 100);
  const keys: (keyof Plot)[] = ["soil", "ph", "slope", "water", "irrigation", "use", "road", "marketKm", "roadKm"];
  const s3 = p.plots.length === 0 ? 0 : Math.round((p.plots.reduce((a, pl) => a + keys.filter((k) => String(pl[k] ?? "").trim()).length / keys.length, 0) / p.plots.length) * 100);
  const s4 = Math.min(100, p.assets.length * 15 + p.livestock.length * 20);
  const s5 = p.historySkipped ? 100 : Math.min(100, p.seasons.length * 34);
  const g = [p.goal, p.targetIncome, p.prefCrops.length > 0, p.organic, p.labour, p.marketPref, p.risk, p.joinGroup === "No" || p.groupId].filter(Boolean).length;
  const s6 = Math.round((g / 8) * 100);
  const s7 = (p.mpesa && p.mpesaName ? 25 : 0) + (p.mpesaVerified ? 35 : 0) + (p.walletPinSet ? 25 : 0) + (p.bankVerified || p.autopay ? 15 : 0);
  return [s0, s1, s2, s3, s4, s5, s6, s7];
}

function missingHint(i: number, p: FarmProfile): string {
  switch (i) {
    case 0: return p.phoneVerified ? "Verified" : "Verify your number";
    case 1: return p.photo ? (p.name && p.idNumber ? "Complete" : "Name + ID needed") : "Add a profile photo";
    case 2: return p.plots.length === 0 ? "Add at least 1 plot" : !p.gps ? "Capture farm GPS" : "Complete";
    case 3: return p.plots.length === 0 ? "Add a plot first" : "Fill soil + water per plot";
    case 4: return p.assets.length + p.livestock.length === 0 ? "Add equipment" : "Complete";
    case 5: return p.historySkipped ? "Skipped" : p.seasons.length === 0 ? "Add a season or skip" : "Complete";
    case 6: return !p.groupId && p.joinGroup !== "No" ? "Answer group question" : "Complete";
    default: return !p.mpesaVerified ? "Verify M-Pesa" : !p.walletPinSet ? "Set wallet PIN" : "Complete";
  }
}

/* ================= page ================= */
function OnboardingPage() {
  const toast = useToast();
  const [profile, setProfile] = useState<FarmProfile>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(DRAFT_KEY);
        if (raw) return { ...DRAFT_PROFILE, ...(JSON.parse(raw) as Partial<FarmProfile>) };
      }
    } catch { /* corrupted draft — fall back to demo */ }
    return DRAFT_PROFILE;
  });
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onYes: () => void } | null>(null);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [editingSeason, setEditingSeason] = useState<SeasonRow | null>(null);
  const [gpsTarget, setGpsTarget] = useState<{ kind: "farm" } | { kind: "plot"; id: string }>({ kind: "farm" });

  const patch = (patchObj: Partial<FarmProfile>) => setProfile((p) => ({ ...p, ...patchObj }));
  const scores = useMemo(() => stepScores(profile), [profile]);
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const aez = useMemo(() => (profile.county ? classifyAEZ(profile.county) : null), [profile.county]);
  const countyDetail = useMemo(() => COUNTIES_DETAILED.find((c) => c.name === profile.county), [profile.county]);
  const totalAcres = profile.plots.reduce((a, p) => a + (Number(p.size) || 0), 0);
  const assetValue = profile.assets.reduce((a, r) => a + r.qty * r.value, 0) + profile.livestock.reduce((a, r) => a + r.count * r.value, 0);

  const saveDraft = () => {
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(profile)); } catch { /* storage full — still confirm UI state */ }
    toast.notify("Draft saved on this device");
  };

  const exportCSV = () => {
    const rows: [string, string][] = [
      ["name", profile.name], ["phone", profile.phone], ["id_number", profile.idNumber],
      ["farm", profile.farmName], ["county", profile.county], ["sub_county", profile.sub],
      ["ward", profile.ward], ["village", profile.village],
      ["gps", profile.gps ? `${profile.gps.lat},${profile.gps.lng} (${profile.gps.acc})` : ""],
      ["aez", aez ? `${aez.code} — ${aez.name}` : ""], ["plots", String(profile.plots.length)],
      ["acres", String(totalAcres)], ["asset_value_kes", String(assetValue)],
      ["goal", profile.goal], ["mpesa", profile.mpesa], ["completeness", `${overall}%`],
    ];
    profile.plots.forEach((pl, i) => rows.push([`plot_${i + 1}`, `${pl.name} | ${pl.size}ac | ${pl.soil || "?"} | pH ${pl.ph || "?"} | ${pl.water || "?"}`]));
    profile.seasons.forEach((s, i) => rows.push([`season_${i + 1}`, `${s.season} | ${s.crop} ${s.variety} | ${s.acreage}ac | ${s.yieldQty}`]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "growmo-farm-profile.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.notify("Farm profile exported as CSV");
  };

  const resetDemo = () => setConfirm({
    title: "Reset demo data?",
    body: "This clears your saved draft and restores Mary's sample farm.",
    onYes: () => {
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
      setProfile(DRAFT_PROFILE); setStep(0); setDone(false);
      toast.notify("Demo data restored");
    },
  });

  const openPlot = (pl: Plot | null) => { setEditingPlot(pl); setModal("plot"); };
  const openSeason = (s: SeasonRow | null) => { setEditingSeason(s); setModal("season"); };
  const askDelete = (title: string, body: string, onYes: () => void) => setConfirm({ title, body, onYes });

  /* ---------- success view ---------- */
  if (done) {
    const recs = aez ? AEZ_CROPS[aez.code] ?? [] : [];
    return (
      <div>
        <Reveal>
          <div className="gm-card text-center p-4">
            <span className="gm-mega-icon mx-auto mb-2" style={{ width: 64, height: 64 }}>
              <CheckCircle2 width={30} height={30} />
            </span>
            <span className="gm-eyebrow"><span className="dot" /> Profile complete</span>
            <h1 className="gm-h-section">Hongera, {profile.name.split(" ")[0] || "farmer"}!</h1>
            <p className="gm-lead">Your farm profile is live. Here's what GrowMO generated for you in seconds.</p>
            <div className="d-flex justify-content-center my-3"><ScoreRing score={overall} size={132} /></div>
          </div>
        </Reveal>
        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <Reveal delay={0.05}>
              <div className="gm-card p-3 h-100">
                <h3 style={{ fontSize: "1rem" }}><MapPin width={17} height={17} /> Your AEZ zone</h3>
                {aez ? (
                  <>
                    <p className="font-display" style={{ fontSize: "1.6rem", margin: "0.2rem 0" }}>{aez.code} — {aez.name}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--gm-ink-700)" }}>{aez.blurb}</p>
                    <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>{aez.altitude} · {aez.rainfall} · {aez.temp}</small>
                  </>
                ) : <p>We'll confirm your zone after your first field sync.</p>}
              </div>
            </Reveal>
          </div>
          <div className="col-md-4">
            <Reveal delay={0.1}>
              <div className="gm-card p-3 h-100">
                <h3 style={{ fontSize: "1rem" }}><Sprout width={17} height={17} /> Recommended crops</h3>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {recs.map((c) => <span key={c} className="gm-chip gm-chip-lime">{c}</span>)}
                </div>
                <p className="mt-2 mb-0" style={{ fontSize: "0.82rem", color: "var(--gm-ink-700)" }}>
                  Matched to {aez?.code ?? "your zone"}, {totalAcres} acres and a {kes(Number(profile.targetIncome) || 0).toLowerCase()} income goal.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="col-md-4">
            <Reveal delay={0.15}>
              <div className="gm-card p-3 h-100">
                <h3 style={{ fontSize: "1rem" }}><CloudSun width={17} height={17} /> Rain outlook</h3>
                <p className="font-display" style={{ fontSize: "1.6rem", margin: "0.2rem 0" }}>Short rains due</p>
                <p style={{ fontSize: "0.85rem", color: "var(--gm-ink-700)" }}>
                  {aez ? `${aez.rainfall} expected in ${aez.name.toLowerCase()} areas. ` : ""}Planting window opens mid-October — your planner will schedule it.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal>
          <div className="gm-card p-3 mt-3 d-flex flex-wrap gap-2 align-items-center">
            <Link to="/app" className="gm-btn gm-btn-lime"><ArrowLeft /> Back to setup hub</Link>
            <button type="button" className="gm-btn gm-btn-outline" onClick={exportCSV}><Download /> Export CSV</button>
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => window.print()}><Printer /> Print summary</button>
            <button type="button" className="gm-btn" disabled title="Ships with Page 2 — Dashboard">Open dashboard <span className="gm-chip gm-chip-gold" style={{ marginLeft: 6 }}>Page 2</span></button>
          </div>
        </Reveal>
      </div>
    );
  }

  /* ---------- wizard view ---------- */
  return (
    <div>
      <Reveal>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div style={{ flex: "1 1 320px" }}>
            <span className="gm-eyebrow"><span className="dot" /> Page 1 · Farm profile</span>
            <h1 className="gm-h-section">Onboarding &amp; Farm Profile</h1>
            <p className="gm-lead">8 quick steps. Your answers power your AEZ zone, crop advice and M-Pesa payouts.</p>
          </div>
          <ScoreRing score={overall} size={96} />
          <div className="d-flex gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setDrawer(true)}><ListChecks /> Review</button>
            <div className="gm-dropdown">
              <button type="button" className="gm-btn gm-btn-dark gm-btn-sm" onClick={() => setMenu(!menu)}>More actions</button>
              {menu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 1065 }} onClick={() => setMenu(false)} />
                  <div className="gm-menu" style={{ zIndex: 1066 }}>
                    <button type="button" onClick={() => { setMenu(false); saveDraft(); }}><Save width={15} height={15} /> Save draft</button>
                    <button type="button" onClick={() => { setMenu(false); exportCSV(); }}><Download width={15} height={15} /> Export CSV</button>
                    <button type="button" onClick={() => { setMenu(false); window.print(); }}><Printer width={15} height={15} /> Print summary</button>
                    <hr />
                    <button type="button" className="danger" onClick={() => { setMenu(false); resetDemo(); }}><RotateCcw width={15} height={15} /> Reset demo</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* stepper */}
      <div className="gm-steps mt-3" role="tablist" aria-label="Onboarding steps">
        {STEP_DEFS.map((s, i) => (
          <button key={s.t} type="button" role="tab" aria-selected={step === i}
            className={`gm-step ${scores[i] === 100 ? "done" : ""} ${step === i ? "now" : ""}`}
            onClick={() => setStep(i)}>
            <span className="n">{scores[i] === 100 ? <Check width={14} height={14} /> : i + 1}</span>
            <span><strong>{s.t}</strong><small>{s.d} · {scores[i]}%</small></span>
          </button>
        ))}
      </div>

      <div className="mt-3">
        {step === 0 && <StepPhone profile={profile} patch={patch} />}
        {step === 1 && <StepIdentity profile={profile} patch={patch} onPhoto={() => setModal("photo")} onKyc={() => setModal("kyc")} />}
        {step === 2 && (
          <StepLocation profile={profile} patch={patch} aez={aez} countyDetail={countyDetail}
            onGps={() => { setGpsTarget({ kind: "farm" }); setModal("gps"); }}
            onAez={() => setModal("aez")} onPlot={openPlot} askDelete={askDelete} />
        )}
        {step === 3 && <StepSoil profile={profile} patch={patch} onKit={() => setModal("soilkit")} onGps={(id) => { setGpsTarget({ kind: "plot", id }); setModal("gps"); }} />}
        {step === 4 && <StepAssets profile={profile} patch={patch} onCustom={() => setModal("asset")} onLivestock={() => setModal("livestock")} askDelete={askDelete} />}
        {step === 5 && <StepHistory profile={profile} patch={patch} onSeason={openSeason} askDelete={askDelete} />}
        {step === 6 && <StepGoals profile={profile} patch={patch} onGroups={() => setModal("group")} />}
        {step === 7 && (
          <StepMpesa profile={profile} patch={patch}
            onVerify={() => setModal("mpesa")} onBank={() => setModal("bank")}
            onPin={() => setModal("pin")} onAutopay={() => setModal("autopay")} />
        )}
      </div>

      {/* footer nav */}
      <div className="gm-card p-3 mt-3 d-flex flex-wrap align-items-center gap-2">
        <button type="button" className="gm-btn gm-btn-outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft /> Back
        </button>
        <span style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: "0.85rem", color: "var(--gm-ink-400)" }}>
          Step {step + 1} of 8 · {STEP_DEFS[step]?.t}
        </span>
        {step === 5 && !profile.historySkipped && (
          <button type="button" className="gm-btn gm-btn-ghost" onClick={() => { patch({ historySkipped: true }); toast.notify("History skipped — you can add it later", "info"); }}>
            Skip for now
          </button>
        )}
        {step < 7 ? (
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(step + 1)}>
            Continue <ChevronRight />
          </button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => setModal("review")}>
            <ClipboardList /> Review &amp; complete
          </button>
        )}
      </div>
      <p className="mt-2 mb-0" style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--gm-ink-400)" }}>
        Demo: everything you enter is stored only in this browser until you save. No data leaves your phone.
      </p>

      {/* review drawer */}
      {drawer && (
        <>
          <div className="gm-scrim" onClick={() => setDrawer(false)} />
          <aside className="gm-drawer wide" role="dialog" aria-label="Profile review">
            <div className="gm-drawer-head">
              <h3>Profile review</h3>
              <button type="button" className="gm-iconbtn" onClick={() => setDrawer(false)} aria-label="Close review"><X /></button>
            </div>
            <div className="gm-drawer-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                <ScoreRing score={overall} size={88} />
                <p className="mb-0" style={{ fontSize: "0.85rem", color: "var(--gm-ink-700)" }}>
                  <strong>{profile.farmName || "Your farm"}</strong> · {totalAcres} acres · {profile.plots.length} plots<br />
                  {profile.village || "—"}, {profile.ward || "—"}, {profile.county || "—"}
                </p>
              </div>
              {STEP_DEFS.map((s, i) => (
                <button key={s.t} type="button" className="gm-checkcard mb-2" onClick={() => { setStep(i); setDrawer(false); }}>
                  <span className="gm-mega-icon" style={{ width: 38, height: 38 }}><s.icon width={17} height={17} /></span>
                  <span style={{ flex: 1 }}>
                    <strong>{i + 1}. {s.t} — {scores[i]}%</strong>
                    <small>{missingHint(i, profile)}</small>
                  </span>
                  <ChevronRight width={16} height={16} color="var(--gm-leaf-600)" />
                </button>
              ))}
            </div>
            <div className="gm-drawer-foot">
              <button type="button" className="gm-btn gm-btn-lime" style={{ flex: 1 }} onClick={() => { setDrawer(false); setModal("review"); }}>
                Open final review
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ============ dialogs ============ */}
      <Dialog open={modal === "photo"} onClose={() => setModal(null)} title="Profile photo" desc="A clear face photo speeds up agent verification.">
        <PhotoCapture photo={profile.photo} onSave={(v) => { patch({ photo: v }); setModal(null); toast.notify(v ? "Profile photo saved" : "Photo removed"); }} />
      </Dialog>

      <Dialog open={modal === "kyc"} onClose={() => setModal(null)} title="Why we ask for this" desc="Every field below unlocks something real.">
        <ul style={{ paddingLeft: "1.1rem", fontSize: "0.88rem", display: "grid", gap: "0.5rem", margin: 0 }}>
          <li><strong>National ID</strong> — lifts your M-Pesa limit to KES 500K/day after verification.</li>
          <li><strong>Date of birth + gender</strong> — qualifies you for youth/women input subsidies.</li>
          <li><strong>Language + literacy</strong> — picks your SMS language and whether advice arrives as text or voice.</li>
          <li><strong>Alt phone + email</strong> — backup channels if your line is off during payout day.</li>
          <li><strong>Photo</strong> — lets agrovet agents confirm it is really you at pickup.</li>
        </ul>
        <FooterBar><button type="button" className="gm-btn gm-btn-lime" onClick={() => setModal(null)}>Got it</button></FooterBar>
      </Dialog>

      <Dialog open={modal === "gps"} onClose={() => setModal(null)} title="Capture GPS" desc={gpsTarget.kind === "farm" ? "Pin your farm gate for deliveries and field visits." : "Pin this plot for mapping and soil records."}>
        <GpsCapture onSave={(g) => {
          if (gpsTarget.kind === "farm") patch({ gps: g });
          else patch({ plots: profile.plots.map((p) => p.id === gpsTarget.id ? { ...p, gps: g } : p) });
          setModal(null); toast.notify("GPS coordinates saved");
        }} />
      </Dialog>

      <Dialog open={modal === "aez"} onClose={() => setModal(null)} title="Agro-ecological zones" desc="Kenya's 11 AEZ belts. Your county auto-picks one." wide>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Zone</th><th>Altitude</th><th>Rainfall</th><th>Counties</th></tr></thead>
            <tbody>
              {AEZ_ZONES.map((z) => (
                <tr key={z.code} style={aez?.code === z.code ? { background: "var(--gm-mint-100)" } : undefined}>
                  <td><strong>{z.code}</strong> · {z.name}{aez?.code === z.code && <span className="gm-chip gm-chip-lime" style={{ marginLeft: 6 }}>You</span>}</td>
                  <td>{z.altitude}</td><td>{z.rainfall}</td><td>{z.counties}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FooterBar><button type="button" className="gm-btn gm-btn-lime" onClick={() => setModal(null)}>Close</button></FooterBar>
      </Dialog>

      <Dialog open={modal === "plot"} onClose={() => setModal(null)} title={editingPlot ? `Edit — ${editingPlot.name}` : "Add a plot"} desc="All 11 plot fields, in 3 quick screens." wide>
        <PlotWizard initial={editingPlot} onSave={(pl) => {
          if (editingPlot) patch({ plots: profile.plots.map((p) => p.id === pl.id ? pl : p) });
          else patch({ plots: [...profile.plots, pl] });
          setModal(null); toast.notify(editingPlot ? "Plot updated" : "Plot added");
        }} />
      </Dialog>

      <Dialog open={modal === "soilkit"} onClose={() => setModal(null)} title="Soil test kit" desc="Lab results in 5 days, plus a free fertilizer recipe.">
        <SoilKit ordered={profile.soilKit} onOrder={(code) => { patch({ soilKit: { ordered: true, code } }); toast.notify("Kit reserved — pay on pickup"); }} onClose={() => setModal(null)} />
      </Dialog>

      <Dialog open={modal === "asset"} onClose={() => setModal(null)} title="Add custom asset" desc="Anything the catalog missed.">
        <AssetForm onSave={(r) => { patch({ assets: [...profile.assets, r] }); setModal(null); toast.notify("Asset added"); }} />
      </Dialog>

      <Dialog open={modal === "livestock"} onClose={() => setModal(null)} title="Add livestock" desc="Animals count toward your farm valuation.">
        <LivestockForm onSave={(r) => { patch({ livestock: [...profile.livestock, r] }); setModal(null); toast.notify("Livestock added"); }} />
      </Dialog>

      <Dialog open={modal === "season"} onClose={() => setModal(null)} title={editingSeason ? `Edit — ${editingSeason.season}` : "Add a season"} desc="What you planted, harvested and earned." wide>
        <SeasonWizard initial={editingSeason} onSave={(s) => {
          if (editingSeason) patch({ seasons: profile.seasons.map((x) => x.id === s.id ? s : x) });
          else patch({ seasons: [...profile.seasons, s] });
          setModal(null); toast.notify(editingSeason ? "Season updated" : "Season saved");
        }} />
      </Dialog>

      <Dialog open={modal === "group"} onClose={() => setModal(null)} title="Farmer groups near you" desc="Bulk inputs, shared transport, better prices." wide>
        <GroupFinder groupId={profile.groupId} onJoin={(id) => { patch({ groupId: id, joinGroup: "Yes" }); setModal(null); toast.notify("Welcome to the group!"); }} onLeave={() => { patch({ groupId: null, joinGroup: "No" }); setModal(null); }} />
      </Dialog>

      <Dialog open={modal === "mpesa"} onClose={() => setModal(null)} title="Verify M-Pesa" desc="We match the registered name before payouts.">
        <MpesaWizard profile={profile} patch={patch} onDone={() => { setModal(null); toast.notify("M-Pesa verified"); }} />
      </Dialog>

      <Dialog open={modal === "bank"} onClose={() => setModal(null)} title="Bank account (optional)" desc="Backup for payouts above M-Pesa limits.">
        <BankForm profile={profile} patch={patch} onDone={() => { setModal(null); toast.notify("Bank account verified"); }} onClose={() => setModal(null)} />
      </Dialog>

      <Dialog open={modal === "pin"} onClose={() => setModal(null)} title="Wallet PIN" desc="4 digits. Needed for payouts and input orders.">
        <PinSetup onDone={() => { patch({ walletPinSet: true }); setModal(null); toast.notify("Wallet PIN set"); }} />
      </Dialog>

      <Dialog open={modal === "autopay"} onClose={() => setModal(null)} title="Auto-pay rules" desc="Never miss a repayment or input order.">
        <AutopayForm limit={profile.autopayLimit} onSave={(v) => { patch({ autopayLimit: v, autopay: true }); setModal(null); toast.notify("Auto-pay enabled"); }} onClose={() => setModal(null)} />
      </Dialog>

      <Dialog open={modal === "review"} onClose={() => setModal(null)} title="Final review" desc="Check everything before we generate your farm plan." wide>
        <ReviewWizard profile={profile} scores={scores} aezCode={aez ? `${aez.code} — ${aez.name}` : "Pending"} onDone={() => { setModal(null); setDone(true); window.scrollTo({ top: 0 }); toast.notify("Farm profile completed"); }} />
      </Dialog>

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)} title={confirm?.title ?? ""} desc={confirm?.body}>
        <FooterBar>
          <button type="button" className="gm-btn gm-btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
          <button type="button" className="gm-btn gm-btn-dark" onClick={() => { confirm?.onYes(); setConfirm(null); }}>Yes, continue</button>
        </FooterBar>
      </Dialog>
    </div>
  );
}

/* ================= shared bits ================= */
function FooterBar({ children }: { children: React.ReactNode }) {
  return <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">{children}</div>;
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "full" : ""}>
      <span className="gm-field-label">{label}</span>
      {children}
    </div>
  );
}

/* ================= step 0: phone ================= */
function StepPhone({ profile, patch }: { profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void }) {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [val, setVal] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const cd = useCountdown(30);
  const validPhone = /^0[17]\d{8}$/.test(profile.phone.trim());

  const send = () => {
    const c = String(Math.floor(1000 + Math.random() * 9000));
    setCode(c); setVal(""); setErr(""); setSent(true); cd.start(30);
  };
  const verify = () => {
    if (val === code && code) { patch({ phoneVerified: true, mpesa: profile.phone }); toast.notify("Phone number verified"); }
    else setErr("That code doesn't match — check the SMS and try again.");
  };

  return (
    <div className="gm-card p-3 p-md-4">
      <h2 style={{ fontSize: "1.15rem" }}><Smartphone width={18} height={18} /> Verify your phone number</h2>
      <p style={{ fontSize: "0.88rem", color: "var(--gm-ink-700)" }}>This number receives payout alerts, weather warnings and your login codes.</p>
      {profile.phoneVerified ? (
        <div className="gm-checkcard on" style={{ cursor: "default" }}>
          <CheckCircle2 color="var(--gm-leaf-600)" />
          <span style={{ flex: 1 }}><strong>{profile.phone} — verified</strong><small>Used for M-Pesa below. Change it any time.</small></span>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => { patch({ phoneVerified: false }); setSent(false); }}>Change</button>
        </div>
      ) : (
        <div className="gm-form-grid" style={{ maxWidth: 560 }}>
          <Field label="Safaricom / Airtel number" full>
            <input className={`gm-input ${profile.phone && !validPhone ? "err" : ""}`} inputMode="tel" placeholder="0712 345 678"
              value={profile.phone} onChange={(e) => patch({ phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} />
            {profile.phone && !validPhone && <div className="gm-ferr">Enter a 10-digit number starting 01 or 07.</div>}
          </Field>
          <div className="full">
            <button type="button" className="gm-btn gm-btn-dark" disabled={!validPhone || cd.running} onClick={send}>
              {cd.running ? `Resend in ${cd.mmss}` : sent ? "Resend code" : "Send code"}
            </button>
          </div>
          {sent && (
            <div className="full">
              <div className="p-3 mb-2" style={{ background: "var(--gm-mint-100)", borderRadius: 14, fontSize: "0.85rem", fontWeight: 700 }}>
                <Info width={15} height={15} /> Demo SMS — your code is <span className="font-display" style={{ fontSize: "1.2rem", letterSpacing: 2 }}>{code.split("").join(" ")}</span>
              </div>
              <OtpInput length={4} value={val} onChange={(v) => { setVal(v); setErr(""); }} label="Enter the 4-digit code" />
              {err && <div className="gm-ferr">{err}</div>}
              <button type="button" className="gm-btn gm-btn-lime mt-2" disabled={val.length < 4} onClick={verify}>Verify number</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= step 1: identity ================= */
function StepIdentity({ profile, patch, onPhoto, onKyc }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; onPhoto: () => void; onKyc: () => void;
}) {
  const idOk = profile.idNumber.replace(/\D/g, "").length >= 7;
  return (
    <div className="gm-card p-3 p-md-4">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h2 className="mb-0" style={{ fontSize: "1.15rem", flex: "1 1 200px" }}>Identity &amp; KYC</h2>
        <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={onKyc}><Info width={15} height={15} /> Why we ask</button>
      </div>
      <div className="d-flex flex-wrap gap-3">
        <button type="button" className="gm-photo-tile" onClick={onPhoto} aria-label="Upload profile photo">
          {profile.photo ? <img src={profile.photo} alt="Profile" /> : <span><Camera width={26} height={26} /><br />Add photo</span>}
        </button>
        <div className="gm-form-grid" style={{ flex: "1 1 420px" }}>
          <Field label="Full name (as on ID)">
            <input className="gm-input" value={profile.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Mary Wanjiku" />
          </Field>
          <Field label="National ID number">
            <input className={`gm-input ${profile.idNumber && !idOk ? "err" : ""}`} inputMode="numeric" value={profile.idNumber}
              onChange={(e) => patch({ idNumber: e.target.value.replace(/[^\d]/g, "").slice(0, 8) })} placeholder="12345678" />
            {profile.idNumber && !idOk && <div className="gm-ferr">ID numbers have 7–8 digits.</div>}
          </Field>
          <Field label="Alternative phone">
            <input className="gm-input" inputMode="tel" value={profile.altPhone} onChange={(e) => patch({ altPhone: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} placeholder="0733 111 222" />
          </Field>
          <Field label="Email (optional)">
            <input className="gm-input" type="email" value={profile.email} onChange={(e) => patch({ email: e.target.value })} placeholder="you@gmail.com" />
          </Field>
          <Field label="Date of birth">
            <input className="gm-input" type="date" value={profile.dob} max="2008-09-17" onChange={(e) => patch({ dob: e.target.value })} />
          </Field>
          <Field label="Gender">
            <select className="gm-select" value={profile.gender} onChange={(e) => patch({ gender: e.target.value })}>
              <option value="">Select…</option>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Preferred language">
            <select className="gm-select" value={profile.language} onChange={(e) => patch({ language: e.target.value })}>
              <option value="">Select…</option>{LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Literacy level">
            <div className="gm-seg" role="radiogroup" aria-label="Literacy level">
              {LITERACY_LEVELS.map((l) => (
                <button key={l} type="button" role="radio" aria-checked={profile.literacy === l}
                  className={profile.literacy === l ? "on" : ""} onClick={() => patch({ literacy: l })}>{l}</button>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}

function PhotoCapture({ photo, onSave }: { photo: string | null; onSave: (v: string | null) => void }) {
  const [preview, setPreview] = useState<string | null>(photo);
  const inputRef = useRef<HTMLInputElement>(null);
  const pick = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPreview(String(r.result));
    r.readAsDataURL(f);
  };
  return (
    <div className="text-center">
      <div className="d-flex justify-content-center mb-3">
        {preview ? <img src={preview} alt="Preview" style={{ width: 180, height: 180, objectFit: "cover", borderRadius: 24 }} />
          : <span className="gm-avatar" style={{ width: 120, height: 120, flexBasis: 120, fontSize: "2rem" }}>M</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <div className="d-flex flex-wrap justify-content-center gap-2">
        <button type="button" className="gm-btn gm-btn-outline" onClick={() => inputRef.current?.click()}><Upload /> {preview ? "Choose another" : "Choose photo"}</button>
        {preview && <button type="button" className="gm-btn gm-btn-ghost" onClick={() => setPreview(null)}>Remove</button>}
      </div>
      <FooterBar>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!preview} onClick={() => onSave(preview)}>Save photo</button>
      </FooterBar>
    </div>
  );
}

/* ================= step 2: location ================= */
function StepLocation({ profile, patch, aez, countyDetail, onGps, onAez, onPlot, askDelete }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; aez: ReturnType<typeof classifyAEZ>;
  countyDetail: { name: string; subs: { name: string; wards: string[] }[] } | undefined;
  onGps: () => void; onAez: () => void; onPlot: (p: Plot | null) => void;
  askDelete: (t: string, b: string, onYes: () => void) => void;
}) {
  const [tab, setTab] = useState<"plots" | "aez">("plots");
  const subs = countyDetail?.subs ?? [];
  const wards = subs.find((s) => s.name === profile.sub)?.wards ?? [];
  const totalAcres = profile.plots.reduce((a, p) => a + (Number(p.size) || 0), 0);

  return (
    <div>
      <div className="gm-card p-3 p-md-4 mb-3">
        <h2 style={{ fontSize: "1.15rem" }}><MapPin width={18} height={18} /> Farm location</h2>
        <div className="gm-form-grid">
          <Field label="Farm name">
            <input className="gm-input" value={profile.farmName} onChange={(e) => patch({ farmName: e.target.value })} placeholder="Mary's Farm" />
          </Field>
          <Field label="County">
            <select className="gm-select" value={profile.county} onChange={(e) => patch({ county: e.target.value, sub: "", ward: "" })}>
              <option value="">Select county…</option>{ALL_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          {countyDetail ? (
            <>
              <Field label="Sub-county">
                <select className="gm-select" value={profile.sub} onChange={(e) => patch({ sub: e.target.value, ward: "" })}>
                  <option value="">Select…</option>{subs.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Ward">
                <select className="gm-select" value={profile.ward} disabled={!profile.sub} onChange={(e) => patch({ ward: e.target.value })}>
                  <option value="">{profile.sub ? "Select…" : "Pick sub-county first"}</option>
                  {wards.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Sub-county (type to add)">
                <input className="gm-input" value={profile.sub} disabled={!profile.county} onChange={(e) => patch({ sub: e.target.value })} placeholder={profile.county ? "Type sub-county…" : "Pick county first"} />
              </Field>
              <Field label="Ward (type to add)">
                <input className="gm-input" value={profile.ward} disabled={!profile.county} onChange={(e) => patch({ ward: e.target.value })} placeholder={profile.county ? "Type ward…" : "Pick county first"} />
              </Field>
            </>
          )}
          <Field label="Village / estate">
            <input className="gm-input" value={profile.village} onChange={(e) => patch({ village: e.target.value })} placeholder="Kwa Kibaki" />
          </Field>
          <Field label="Farm gate GPS">
            <div className="d-flex gap-2 align-items-center">
              <input className="gm-input" readOnly value={profile.gps ? `${profile.gps.lat}, ${profile.gps.lng} (${profile.gps.acc})` : ""} placeholder="Not captured yet" />
              <button type="button" className="gm-btn gm-btn-dark gm-btn-sm" style={{ whiteSpace: "nowrap" }} onClick={onGps}>
                <LocateFixed width={15} height={15} /> {profile.gps ? "Retake" : "Capture"}
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="gm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "plots"} className={`gm-tab ${tab === "plots" ? "on" : ""}`} onClick={() => setTab("plots")}>
          <Leaf width={15} height={15} /> Plots ({profile.plots.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === "aez"} className={`gm-tab ${tab === "aez" ? "on" : ""}`} onClick={() => setTab("aez")}>
          <CloudSun width={15} height={15} /> AEZ zone {aez ? `· ${aez.code}` : ""}
        </button>
      </div>

      {tab === "plots" ? (
        <div className="gm-card p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h3 className="mb-0" style={{ fontSize: "1rem", flex: "1 1 200px" }}>Your plots · {totalAcres} acres total</h3>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onPlot(null)}><Plus width={15} height={15} /> Add plot</button>
          </div>
          {profile.plots.length === 0 ? (
            <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>No plots yet — add your first one to unlock soil, weather and planner advice.</p>
          ) : (
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead><tr><th>Plot</th><th>Size</th><th>Soil</th><th>Water</th><th>GPS</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                <tbody>
                  {profile.plots.map((pl) => (
                    <tr key={pl.id}>
                      <td><strong>{pl.name || "Unnamed plot"}</strong></td>
                      <td>{pl.size} ac</td>
                      <td>{pl.soil || <span style={{ color: "var(--gm-ink-400)" }}>—</span>}{pl.ph ? ` · pH ${pl.ph}` : ""}</td>
                      <td>{pl.water || <span style={{ color: "var(--gm-ink-400)" }}>—</span>}</td>
                      <td>{pl.gps ? <span className="gm-chip">Pinned</span> : <span style={{ color: "var(--gm-ink-400)" }}>—</span>}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button type="button" className="gm-iconbtn" title="Edit plot" onClick={() => onPlot(pl)}><Pencil /></button>{" "}
                        <button type="button" className="gm-iconbtn danger" title="Delete plot"
                          onClick={() => askDelete("Delete this plot?", `"${pl.name || "Unnamed plot"}" and its soil data will be removed.`, () => patch({ plots: profile.plots.filter((p) => p.id !== pl.id) }))}>
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="gm-card p-3 p-md-4">
          {aez ? (
            <>
              <p className="gm-chip gm-chip-lime mb-2">Auto-detected from {profile.county || "your county"}</p>
              <h3 className="font-display" style={{ fontSize: "1.5rem" }}>{aez.code} — {aez.name}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--gm-ink-700)" }}>{aez.blurb}</p>
              <div className="gm-form-grid cols3 mb-3">
                <div><span className="gm-field-label">Altitude</span><strong>{aez.altitude}</strong></div>
                <div><span className="gm-field-label">Rainfall</span><strong>{aez.rainfall}</strong></div>
                <div><span className="gm-field-label">Temperature</span><strong>{aez.temp}</strong></div>
              </div>
              <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onAez}>View all 11 zones</button>
            </>
          ) : (
            <>
              <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>
                {profile.county ? `We don't have a zone map for ${profile.county} yet — an agronomist will confirm it on your first sync.` : "Pick your county above and we'll detect your AEZ zone instantly."}
              </p>
              <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onAez}>Browse all 11 zones</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GpsCapture({ onSave }: { onSave: (g: { lat: string; lng: string; acc: string }) => void }) {
  const [phase, setPhase] = useState<"idle" | "busy" | "done">("idle");
  const [pct, setPct] = useState(0);
  const [coords, setCoords] = useState({ lat: "-1.0584", lng: "36.7831", acc: "±120m" });

  useEffect(() => {
    if (phase !== "busy") return;
    const t = setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 8 + Math.random() * 10);
        const acc = n > 80 ? "±5m" : n > 50 ? "±18m" : n > 25 ? "±45m" : "±120m";
        setCoords({
          lat: (-1.0584 + (Math.random() - 0.5) * (100 - n) * 0.0004).toFixed(4),
          lng: (36.7831 + (Math.random() - 0.5) * (100 - n) * 0.0004).toFixed(4),
          acc,
        });
        if (n >= 100) { clearInterval(t); setPhase("done"); }
        return n;
      });
    }, 220);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="text-center">
      <span className="gm-mega-icon mx-auto mb-2" style={{ width: 60, height: 60 }}><Navigation width={26} height={26} /></span>
      {phase === "idle" && (
        <>
          <p style={{ fontSize: "0.9rem", color: "var(--gm-ink-700)" }}>Stand at your farm gate and tap capture. We lock 6+ satellites for a ±5m pin.</p>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { setPct(0); setPhase("busy"); }}>
            <LocateFixed /> Start capture
          </button>
        </>
      )}
      {phase === "busy" && (
        <>
          <p className="font-display" style={{ fontSize: "1.3rem" }}>{coords.lat}, {coords.lng}</p>
          <p style={{ fontWeight: 800, color: "var(--gm-leaf-700)" }}>Accuracy {coords.acc} · {Math.round(pct)}%</p>
          <div style={{ height: 10, borderRadius: 99, background: "var(--gm-mint-100)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--gm-grad-primary)" }} />
          </div>
          <p className="mt-2" style={{ fontSize: "0.82rem", color: "var(--gm-ink-400)", fontWeight: 700 }}>Hold still — locking satellites…</p>
        </>
      )}
      {phase === "done" && (
        <>
          <p className="gm-chip mb-2"><Check width={13} height={13} /> Lock acquired · {coords.acc}</p>
          <p className="font-display" style={{ fontSize: "1.4rem" }}>{coords.lat}, {coords.lng}</p>
          <div className="d-flex justify-content-center gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => { setPct(0); setPhase("busy"); }}><RefreshCw /> Retake</button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => onSave(coords)}>Save pin</button>
          </div>
        </>
      )}
    </div>
  );
}

function PlotWizard({ initial, onSave }: { initial: Plot | null; onSave: (p: Plot) => void }) {
  const [ws, setWs] = useState(0);
  const [d, setD] = useState<Plot>(initial ?? {
    id: uid(), name: "", size: 1, soil: "", ph: "", slope: "", water: "",
    irrigation: "", use: "", road: "", marketKm: "", roadKm: "",
  });
  const set = (p: Partial<Plot>) => setD((x) => ({ ...x, ...p }));
  const jitterPin = () => set({
    gps: {
      lat: (-1.0584 + (Math.random() - 0.5) * 0.01).toFixed(4),
      lng: (36.7831 + (Math.random() - 0.5) * 0.01).toFixed(4),
      acc: "±6m",
    },
  });
  const canNext = ws === 0 ? d.name.trim() && Number(d.size) > 0 : true;

  return (
    <div>
      <div className="gm-wsteps"><span className={ws >= 0 ? "on" : ""} /><span className={ws >= 1 ? "on" : ""} /><span className={ws >= 2 ? "on" : ""} /></div>
      {ws === 0 && (
        <div className="gm-form-grid">
          <Field label="Plot name" full>
            <input className="gm-input" value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Shamba ya nyumba" />
          </Field>
          <Field label="Size (acres)">
            <input className="gm-input" type="number" min={0.1} step={0.1} value={d.size} onChange={(e) => set({ size: Number(e.target.value) })} />
          </Field>
          <Field label="Current use">
            <select className="gm-select" value={d.use} onChange={(e) => set({ use: e.target.value })}>
              <option value="">Select…</option>{LAND_USES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Plot GPS pin" full>
            <div className="d-flex gap-2 align-items-center">
              <input className="gm-input" readOnly value={d.gps ? `${d.gps.lat}, ${d.gps.lng}` : ""} placeholder="Optional — pin it now or later" />
              <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" style={{ whiteSpace: "nowrap" }} onClick={jitterPin}>
                <LocateFixed width={15} height={15} /> Pin
              </button>
            </div>
          </Field>
        </div>
      )}
      {ws === 1 && (
        <div className="gm-form-grid">
          <Field label="Soil type">
            <select className="gm-select" value={d.soil} onChange={(e) => set({ soil: e.target.value })}>
              <option value="">Select…</option>{SOIL_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Soil pH (4.0 – 9.0)">
            <input className="gm-input" inputMode="decimal" value={d.ph} onChange={(e) => set({ ph: e.target.value.replace(/[^\d.]/g, "").slice(0, 4) })} placeholder="6.2" />
          </Field>
          <Field label="Slope">
            <select className="gm-select" value={d.slope} onChange={(e) => set({ slope: e.target.value })}>
              <option value="">Select…</option>{SLOPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Water source">
            <select className="gm-select" value={d.water} onChange={(e) => set({ water: e.target.value })}>
              <option value="">Select…</option>{WATER_SOURCES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Irrigation">
            <select className="gm-select" value={d.irrigation} onChange={(e) => set({ irrigation: e.target.value })}>
              <option value="">Select…</option>{IRRIGATION_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Road access">
            <select className="gm-select" value={d.road} onChange={(e) => set({ road: e.target.value })}>
              <option value="">Select…</option>{ROAD_ACCESS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
        </div>
      )}
      {ws === 2 && (
        <div className="gm-form-grid">
          <Field label="Distance to market (km)">
            <input className="gm-input" inputMode="decimal" value={d.marketKm} onChange={(e) => set({ marketKm: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) })} placeholder="4" />
          </Field>
          <Field label="Distance to tarmac (km)">
            <input className="gm-input" inputMode="decimal" value={d.roadKm} onChange={(e) => set({ roadKm: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) })} placeholder="0.5" />
          </Field>
          <div className="full p-3" style={{ background: "var(--gm-mint-50)", borderRadius: 14, fontSize: "0.86rem" }}>
            <strong>{d.name || "Unnamed plot"}</strong> · {d.size} ac · {d.soil || "soil?"} · {d.water || "water?"} · {d.irrigation || "rain-fed"}
          </div>
        </div>
      )}
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline" disabled={ws === 0} onClick={() => setWs(ws - 1)}><ChevronLeft /> Back</button>
        {ws < 2 ? (
          <button type="button" className="gm-btn gm-btn-lime" disabled={!canNext} onClick={() => setWs(ws + 1)}>Continue <ChevronRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime" disabled={!canNext} onClick={() => onSave(d)}><Check /> Save plot</button>
        )}
      </div>
    </div>
  );
}

/* ================= step 3: soil ================= */
function StepSoil({ profile, patch, onKit, onGps }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; onKit: () => void; onGps: (id: string) => void;
}) {
  const [active, setActive] = useState(profile.plots[0]?.id ?? "");
  const plot = profile.plots.find((p) => p.id === active) ?? profile.plots[0];
  const setPlot = (id: string, p: Partial<Plot>) => patch({ plots: profile.plots.map((x) => x.id === id ? { ...x, ...p } : x) });
  const copyFromFirst = () => {
    const src = profile.plots[0];
    if (!src || !plot || src.id === plot.id) return;
    const { id, name, size, gps, ...rest } = src;
    void id; void name; void size; void gps;
    setPlot(plot.id, rest);
  };
  const keys: (keyof Plot)[] = ["soil", "ph", "slope", "water", "irrigation", "use", "road", "marketKm", "roadKm"];
  const pct = (pl: Plot) => Math.round((keys.filter((k) => String(pl[k] ?? "").trim()).length / keys.length) * 100);

  if (profile.plots.length === 0) {
    return (
      <div className="gm-card p-4 text-center">
        <FlaskConical width={30} height={30} color="var(--gm-leaf-600)" />
        <h2 style={{ fontSize: "1.1rem" }}>No plots yet</h2>
        <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>Add a plot in Step 3 (Location) first — soil forms appear here per plot.</p>
      </div>
    );
  }
  if (!plot) return null;

  return (
    <div>
      <div className="gm-card p-3 p-md-4 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h2 className="mb-0" style={{ fontSize: "1.15rem", flex: "1 1 220px" }}>Soil &amp; water per plot</h2>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onKit}>
            <FlaskConical width={15} height={15} /> {profile.soilKit.ordered ? `Kit ${profile.soilKit.code}` : "Order soil test kit"}
          </button>
        </div>
        <div className="gm-tabs" role="tablist">
          {profile.plots.map((pl) => (
            <button key={pl.id} type="button" role="tab" aria-selected={plot.id === pl.id}
              className={`gm-tab ${plot.id === pl.id ? "on" : ""}`} onClick={() => setActive(pl.id)}>
              {pl.name || "Unnamed"} · {pct(pl)}%
            </button>
          ))}
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <strong style={{ flex: "1 1 200px" }}>{plot.name || "Unnamed plot"} — {plot.size} acres · {pct(plot)}% filled</strong>
          {profile.plots.length > 1 && plot.id !== profile.plots[0]?.id && (
            <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={copyFromFirst}>
              <Copy width={14} height={14} /> Copy from {profile.plots[0]?.name || "Plot 1"}
            </button>
          )}
          <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => onGps(plot.id)}>
            <LocateFixed width={14} height={14} /> {plot.gps ? "GPS pinned" : "Pin GPS"}
          </button>
        </div>
        <div className="gm-form-grid cols3">
          <Field label="Soil type">
            <select className="gm-select" value={plot.soil} onChange={(e) => setPlot(plot.id, { soil: e.target.value })}>
              <option value="">Select…</option>{SOIL_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Soil pH">
            <input className="gm-input" inputMode="decimal" value={plot.ph} onChange={(e) => setPlot(plot.id, { ph: e.target.value.replace(/[^\d.]/g, "").slice(0, 4) })} placeholder="6.2" />
          </Field>
          <Field label="Slope">
            <select className="gm-select" value={plot.slope} onChange={(e) => setPlot(plot.id, { slope: e.target.value })}>
              <option value="">Select…</option>{SLOPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Water source">
            <select className="gm-select" value={plot.water} onChange={(e) => setPlot(plot.id, { water: e.target.value })}>
              <option value="">Select…</option>{WATER_SOURCES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Irrigation">
            <select className="gm-select" value={plot.irrigation} onChange={(e) => setPlot(plot.id, { irrigation: e.target.value })}>
              <option value="">Select…</option>{IRRIGATION_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Current use">
            <select className="gm-select" value={plot.use} onChange={(e) => setPlot(plot.id, { use: e.target.value })}>
              <option value="">Select…</option>{LAND_USES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Road access">
            <select className="gm-select" value={plot.road} onChange={(e) => setPlot(plot.id, { road: e.target.value })}>
              <option value="">Select…</option>{ROAD_ACCESS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Market (km)">
            <input className="gm-input" inputMode="decimal" value={plot.marketKm} onChange={(e) => setPlot(plot.id, { marketKm: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) })} placeholder="4" />
          </Field>
          <Field label="Tarmac (km)">
            <input className="gm-input" inputMode="decimal" value={plot.roadKm} onChange={(e) => setPlot(plot.id, { roadKm: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) })} placeholder="0.5" />
          </Field>
        </div>
      </div>
    </div>
  );
}

const AGROVETS = ["Githunguri Farmers Agrovet", "Limuru Mbegu & Inputs", "Thika Road Agrochem", "Ruiru Farm Supplies"];

function SoilKit({ ordered, onOrder, onClose }: {
  ordered: { ordered: boolean; code: string }; onOrder: (code: string) => void; onClose: () => void;
}) {
  const toast = useToast();
  const [agrovet, setAgrovet] = useState(AGROVETS[0]);
  if (ordered.ordered) {
    return (
      <div className="text-center">
        <p className="gm-chip gm-chip-lime mb-2"><Check width={13} height={13} /> Reserved</p>
        <p className="font-display" style={{ fontSize: "1.8rem" }}>{ordered.code}</p>
        <p style={{ fontSize: "0.88rem", color: "var(--gm-ink-700)" }}>
          Show this code at your agrovet and pay <strong>KES 1,200</strong> on pickup. Results + fertilizer recipe arrive by SMS in 5 days.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={() => { try { navigator.clipboard.writeText(ordered.code); } catch { /* clipboard blocked */ } toast.notify("Pickup code copied", "info"); }}>
            <Copy /> Copy code
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ul style={{ paddingLeft: "1.1rem", fontSize: "0.88rem", display: "grid", gap: "0.4rem" }}>
        <li>Tests pH, nitrogen, phosphorus, potassium + organic matter</li>
        <li>Free fertilizer recipe per plot, in your language</li>
        <li>KES 1,200 — pay cash or M-Pesa when you collect the kit</li>
      </ul>
      <Field label="Pickup agrovet">
        <select className="gm-select" value={agrovet} onChange={(e) => setAgrovet(e.target.value)}>
          {AGROVETS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </Field>
      <FooterBar>
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => onOrder(`SK-${Math.floor(1000 + Math.random() * 9000)}`)}>
          Reserve at {agrovet.split(" ")[0]}
        </button>
      </FooterBar>
    </div>
  );
}

/* ================= step 4: assets ================= */
function StepAssets({ profile, patch, onCustom, onLivestock, askDelete }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void;
  onCustom: () => void; onLivestock: () => void;
  askDelete: (t: string, b: string, onYes: () => void) => void;
}) {
  const [cat, setCat] = useState(ASSET_CATALOG[0]?.id ?? "");
  const active = ASSET_CATALOG.find((c) => c.id === cat) ?? ASSET_CATALOG[0];
  const has = (item: string) => profile.assets.some((a) => a.item === item);
  const toggleItem = (item: string) => {
    if (!active) return;
    if (has(item)) patch({ assets: profile.assets.filter((a) => a.item !== item) });
    else patch({ assets: [...profile.assets, { id: uid(), category: active.label, item, qty: 1, condition: "Good", value: 0 }] });
  };
  const setAsset = (id: string, r: Partial<AssetRow>) => patch({ assets: profile.assets.map((a) => a.id === id ? { ...a, ...r } : a) });
  const total = profile.assets.reduce((a, r) => a + r.qty * r.value, 0) + profile.livestock.reduce((a, r) => a + r.count * r.value, 0);

  return (
    <div>
      <div className="gm-card p-3 p-md-4 mb-3">
        <h2 style={{ fontSize: "1.15rem" }}><Tractor width={18} height={18} /> Equipment &amp; structures</h2>
        <div className="gm-tabs" role="tablist">
          {ASSET_CATALOG.filter((c) => c.id !== "livestock" && c.id !== "tech").map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={cat === c.id}
              className={`gm-tab ${cat === c.id ? "on" : ""}`} onClick={() => setCat(c.id)}>{c.label}</button>
          ))}
          <button type="button" role="tab" aria-selected={cat === "tech"}
            className={`gm-tab ${cat === "tech" ? "on" : ""}`} onClick={() => setCat("tech")}>Technology</button>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(active?.id === "livestock" ? [] : active?.items ?? []).map((item) => (
            <button key={item} type="button" className={`gm-chipbtn ${has(item) ? "on" : ""}`} onClick={() => toggleItem(item)}>
              {has(item) && <Check width={13} height={13} />} {item}
            </button>
          ))}
          <button type="button" className="gm-chipbtn" onClick={onCustom}><Plus width={13} height={13} /> Custom…</button>
        </div>
        {profile.assets.length > 0 && (
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Condition</th><th>Value (each)</th><th style={{ textAlign: "right" }}>Remove</th></tr></thead>
              <tbody>
                {profile.assets.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.item}</strong></td>
                    <td>{a.category}</td>
                    <td>
                      <span className="gm-qty">
                        <button type="button" aria-label="Decrease" onClick={() => setAsset(a.id, { qty: Math.max(1, a.qty - 1) })}>−</button>
                        <strong>{a.qty}</strong>
                        <button type="button" aria-label="Increase" onClick={() => setAsset(a.id, { qty: a.qty + 1 })}>+</button>
                      </span>
                    </td>
                    <td>
                      <select className="gm-select" style={{ minWidth: 110 }} value={a.condition} onChange={(e) => setAsset(a.id, { condition: e.target.value })}>
                        {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td>
                      <input className="gm-input" style={{ minWidth: 110 }} inputMode="numeric" value={a.value || ""}
                        placeholder="0" onChange={(e) => setAsset(a.id, { value: Number(e.target.value.replace(/[^\d]/g, "")) || 0 })} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="gm-iconbtn danger" title={`Remove ${a.item}`}
                        onClick={() => askDelete("Remove asset?", `"${a.item}" will be removed from your inventory.`, () => patch({ assets: profile.assets.filter((x) => x.id !== a.id) }))}>
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="gm-card p-3 p-md-4">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h3 className="mb-0" style={{ fontSize: "1rem", flex: "1 1 200px" }}>Livestock · {profile.livestock.reduce((a, l) => a + l.count, 0)} animals</h3>
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onLivestock}><Plus width={15} height={15} /> Add livestock</button>
        </div>
        {profile.livestock.length === 0 ? (
          <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>No animals recorded. Dairy cows and kienyeji chickens count here.</p>
        ) : (
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead><tr><th>Type</th><th>Breed</th><th>Count</th><th>Value (each)</th><th style={{ textAlign: "right" }}>Remove</th></tr></thead>
              <tbody>
                {profile.livestock.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.type}</strong></td>
                    <td>{l.breed}</td>
                    <td>
                      <span className="gm-qty">
                        <button type="button" aria-label="Decrease" onClick={() => patch({ livestock: profile.livestock.map((x) => x.id === l.id ? { ...x, count: Math.max(1, x.count - 1) } : x) })}>−</button>
                        <strong>{l.count}</strong>
                        <button type="button" aria-label="Increase" onClick={() => patch({ livestock: profile.livestock.map((x) => x.id === l.id ? { ...x, count: x.count + 1 } : x) })}>+</button>
                      </span>
                    </td>
                    <td>{kes(l.value)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="gm-iconbtn danger" title={`Remove ${l.type}`}
                        onClick={() => askDelete("Remove livestock?", `"${l.type} (${l.breed})" will be removed.`, () => patch({ livestock: profile.livestock.filter((x) => x.id !== l.id) }))}>
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 mb-0 font-display" style={{ fontSize: "1.1rem" }}>Estimated asset value: {kes(total)}</p>
      </div>
    </div>
  );
}

function AssetForm({ onSave }: { onSave: (r: AssetRow) => void }) {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState(ASSET_CATALOG[0]?.label ?? "");
  const [qty, setQty] = useState(1);
  const [condition, setCondition] = useState("Good");
  const [value, setValue] = useState("");
  return (
    <div className="gm-form-grid">
      <Field label="Asset name" full>
        <input className="gm-input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Knapsack sprayer" />
      </Field>
      <Field label="Category">
        <select className="gm-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {ASSET_CATALOG.filter((c) => c.id !== "livestock").map((c) => <option key={c.id} value={c.label}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Condition">
        <select className="gm-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Quantity">
        <span className="gm-qty">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <strong>{qty}</strong>
          <button type="button" onClick={() => setQty(qty + 1)}>+</button>
        </span>
      </Field>
      <Field label="Value each (KES)">
        <input className="gm-input" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))} placeholder="3500" />
      </Field>
      <div className="full">
        <FooterBar>
          <button type="button" className="gm-btn gm-btn-lime" disabled={!item.trim()}
            onClick={() => onSave({ id: uid(), category, item: item.trim(), qty, condition, value: Number(value) || 0 })}>
            Add asset
          </button>
        </FooterBar>
      </div>
    </div>
  );
}

function LivestockForm({ onSave }: { onSave: (r: LivestockRow) => void }) {
  const [type, setType] = useState("Dairy cattle");
  const [breed, setBreed] = useState(LIVESTOCK_BREEDS["Dairy cattle"]?.[0] ?? "");
  const [count, setCount] = useState(1);
  const [value, setValue] = useState("");
  return (
    <div className="gm-form-grid">
      <Field label="Animal type">
        <select className="gm-select" value={type} onChange={(e) => { setType(e.target.value); setBreed(LIVESTOCK_BREEDS[e.target.value]?.[0] ?? ""); }}>
          {Object.keys(LIVESTOCK_BREEDS).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Breed">
        <select className="gm-select" value={breed} onChange={(e) => setBreed(e.target.value)}>
          {(LIVESTOCK_BREEDS[type] ?? []).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Count">
        <span className="gm-qty">
          <button type="button" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
          <strong>{count}</strong>
          <button type="button" onClick={() => setCount(count + 1)}>+</button>
        </span>
      </Field>
      <Field label="Value each (KES)">
        <input className="gm-input" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))} placeholder="70000" />
      </Field>
      <div className="full">
        <FooterBar>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onSave({ id: uid(), type, breed, count, value: Number(value) || 0 })}>
            Add livestock
          </button>
        </FooterBar>
      </div>
    </div>
  );
}

/* ================= step 5: history ================= */
function StepHistory({ profile, patch, onSeason, askDelete }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; onSeason: (s: SeasonRow | null) => void;
  askDelete: (t: string, b: string, onYes: () => void) => void;
}) {
  if (profile.historySkipped) {
    return (
      <div className="gm-card p-4 text-center">
        <History width={30} height={30} color="var(--gm-leaf-600)" />
        <h2 style={{ fontSize: "1.1rem" }}>History skipped</h2>
        <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>Past seasons help us predict your yields. Add them any time.</p>
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => { patch({ historySkipped: false }); onSeason(null); }}>
          <Plus /> Add my first season
        </button>
      </div>
    );
  }
  return (
    <div className="gm-card p-3 p-md-4">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <h2 className="mb-0" style={{ fontSize: "1.15rem", flex: "1 1 220px" }}>Crop history <small style={{ fontWeight: 600, color: "var(--gm-ink-400)" }}>(optional)</small></h2>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onSeason(null)}><Plus width={15} height={15} /> Add season</button>
      </div>
      {profile.seasons.length === 0 ? (
        <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>No seasons yet — or skip this step below and continue.</p>
      ) : (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Season</th><th>Crop</th><th>Acres</th><th>Yield</th><th>Price</th><th>Rating</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {profile.seasons.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.season}</strong></td>
                  <td>{s.crop}{s.variety ? ` · ${s.variety}` : ""}{s.challenges.length > 0 && <><br /><small style={{ color: "var(--gm-ink-400)" }}>{s.challenges.join(", ")}</small></>}</td>
                  <td>{s.acreage}</td>
                  <td>{s.yieldQty || "—"}</td>
                  <td>{s.price || "—"}</td>
                  <td>
                    <span className="gm-rate" style={{ pointerEvents: "none" }}>
                      {[1, 2, 3, 4, 5].map((i) => <button key={i} type="button" tabIndex={-1} className={i <= s.satisfaction ? "on" : ""}><Star /></button>)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button type="button" className="gm-iconbtn" title="Edit season" onClick={() => onSeason(s)}><Pencil /></button>{" "}
                    <button type="button" className="gm-iconbtn danger" title="Delete season"
                      onClick={() => askDelete("Delete season?", `"${s.season} — ${s.crop}" will be removed.`, () => patch({ seasons: profile.seasons.filter((x) => x.id !== s.id) }))}>
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SeasonWizard({ initial, onSave }: { initial: SeasonRow | null; onSave: (s: SeasonRow) => void }) {
  const [ws, setWs] = useState(0);
  const [pick, setPick] = useState(false);
  const [d, setD] = useState<SeasonRow>(initial ?? {
    id: uid(), season: "LR 2026", crop: "Maize", variety: "", acreage: 1,
    yieldQty: "", price: "", challenges: [], satisfaction: 3,
  });
  const set = (p: Partial<SeasonRow>) => setD((x) => ({ ...x, ...p }));
  const toggleCh = (c: string) => set({ challenges: d.challenges.includes(c) ? d.challenges.filter((x) => x !== c) : [...d.challenges, c] });

  return (
    <div>
      <div className="gm-wsteps"><span className={ws >= 0 ? "on" : ""} /><span className={ws >= 1 ? "on" : ""} /><span className={ws >= 2 ? "on" : ""} /></div>
      {ws === 0 && (
        <div className="gm-form-grid">
          <Field label="Season">
            <select className="gm-select" value={d.season} onChange={(e) => set({ season: e.target.value })}>
              {CROP_SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Acreage">
            <input className="gm-input" type="number" min={0.1} step={0.1} value={d.acreage} onChange={(e) => set({ acreage: Number(e.target.value) })} />
          </Field>
          <Field label="Crop">
            <select className="gm-select" value={d.crop} onChange={(e) => set({ crop: e.target.value, variety: "" })}>
              {CROP_LIBRARY.map((c) => <option key={c.crop} value={c.crop}>{c.crop}</option>)}
            </select>
          </Field>
          <Field label="Variety">
            <div className="d-flex gap-2">
              <input className="gm-input" readOnly value={d.variety} placeholder="Pick from catalog" />
              <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" style={{ whiteSpace: "nowrap" }} onClick={() => setPick(true)}>
                <Search width={15} height={15} /> Browse
              </button>
            </div>
          </Field>
        </div>
      )}
      {ws === 1 && (
        <div className="gm-form-grid">
          <Field label={`Total yield (${CROP_LIBRARY.find((c) => c.crop === d.crop)?.unit ?? "units"})`}>
            <input className="gm-input" value={d.yieldQty} onChange={(e) => set({ yieldQty: e.target.value })} placeholder="e.g. 18 bags" />
          </Field>
          <Field label="Average price">
            <input className="gm-input" value={d.price} onChange={(e) => set({ price: e.target.value })} placeholder="e.g. KES 3,200/bag" />
          </Field>
          <Field label="Challenges faced" full>
            <div className="d-flex flex-wrap gap-2">
              {CHALLENGES.map((c) => (
                <button key={c} type="button" className={`gm-chipbtn ${d.challenges.includes(c) ? "on" : ""}`} onClick={() => toggleCh(c)}>{c}</button>
              ))}
            </div>
          </Field>
        </div>
      )}
      {ws === 2 && (
        <div className="text-center">
          <p style={{ fontWeight: 800 }}>How satisfied were you with {d.season}?</p>
          <div className="d-flex justify-content-center">
            <span className="gm-rate">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" aria-label={`${i} stars`} className={i <= d.satisfaction ? "on" : ""} onClick={() => set({ satisfaction: i })}>
                  <Star />
                </button>
              ))}
            </span>
          </div>
          <div className="p-3 mt-3 text-start" style={{ background: "var(--gm-mint-50)", borderRadius: 14, fontSize: "0.86rem" }}>
            <strong>{d.season}</strong> · {d.crop}{d.variety ? ` (${d.variety})` : ""} · {d.acreage} ac · {d.yieldQty || "no yield"} · {d.price || "no price"}
          </div>
        </div>
      )}
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline" disabled={ws === 0} onClick={() => setWs(ws - 1)}><ChevronLeft /> Back</button>
        {ws < 2 ? (
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => setWs(ws + 1)}>Continue <ChevronRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onSave(d)}><Check /> Save season</button>
        )}
      </div>

      <Dialog open={pick} onClose={() => setPick(false)} title={`${d.crop} varieties`} desc="Certified varieties from Kenyan seed houses." wide>
        <VarietyPicker crop={d.crop} onPick={(v) => { set({ variety: v }); setPick(false); }} />
      </Dialog>
    </div>
  );
}

function VarietyPicker({ crop, onPick }: { crop: string; onPick: (v: string) => void }) {
  const [q, setQ] = useState("");
  const entry = CROP_LIBRARY.find((c) => c.crop === crop);
  const rows = (entry?.varieties ?? []).filter((v) => v.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="gm-form-grid mb-2">
        <Field label="Search varieties" full>
          <input className="gm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to filter…" />
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead><tr><th>Variety</th><th>Yield unit</th><th style={{ textAlign: "right" }}>Pick</th></tr></thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v}>
                <td><strong>{v}</strong></td>
                <td>{entry?.unit}</td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onPick(v)}>Select</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3}>No varieties match "{q}".</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= step 6: goals ================= */
function StepGoals({ profile, patch, onGroups }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; onGroups: () => void;
}) {
  const toggleCrop = (c: string) => patch({ prefCrops: profile.prefCrops.includes(c) ? profile.prefCrops.filter((x) => x !== c) : [...profile.prefCrops, c] });
  const toggleCert = (c: string) => patch({ certs: profile.certs.includes(c) ? profile.certs.filter((x) => x !== c) : [...profile.certs, c] });
  const group = FARMER_GROUPS.find((g) => g.id === profile.groupId);

  return (
    <div>
      <div className="gm-card p-3 p-md-4 mb-3">
        <h2 style={{ fontSize: "1.15rem" }}><Target width={18} height={18} /> Farming goals</h2>
        <span className="gm-field-label">Main goal</span>
        <div className="gm-form-grid mb-3">
          {GOALS.map((g) => (
            <button key={g.id} type="button" className={`gm-checkcard ${profile.goal === g.id ? "on" : ""}`} onClick={() => patch({ goal: g.id })}>
              <input type="radio" checked={profile.goal === g.id} readOnly tabIndex={-1} />
              <span><strong>{g.label}</strong><small>{g.desc}</small></span>
            </button>
          ))}
          <div className="full">
            <Field label="Target income per year (KES)" full>
              <input className="gm-input" inputMode="numeric" style={{ maxWidth: 320 }} value={profile.targetIncome}
                onChange={(e) => patch({ targetIncome: e.target.value.replace(/[^\d]/g, "").slice(0, 9) })} placeholder="250000" />
            </Field>
            {profile.targetIncome && (
              <p className="mb-0 mt-1 font-display" style={{ fontSize: "1.05rem" }}>≈ {kes(Number(profile.targetIncome))} / year</p>
            )}
          </div>
        </div>
        <span className="gm-field-label">Preferred crops (pick any)</span>
        <div className="d-flex flex-wrap gap-2">
          {CROP_LIBRARY.map((c) => (
            <button key={c.crop} type="button" className={`gm-chipbtn ${profile.prefCrops.includes(c.crop) ? "on" : ""}`} onClick={() => toggleCrop(c.crop)}>
              {profile.prefCrops.includes(c.crop) && <Check width={13} height={13} />} {c.crop}
            </button>
          ))}
        </div>
      </div>

      <div className="gm-card p-3 p-md-4 mb-3">
        <h3 style={{ fontSize: "1rem" }}><Leaf width={17} height={17} /> Practices &amp; labour</h3>
        <div className="gm-form-grid">
          <Field label="Farming practice" full>
            <div className="gm-seg" role="radiogroup">
              {ORGANIC_OPTS.map((o) => (
                <button key={o} type="button" role="radio" aria-checked={profile.organic === o}
                  className={profile.organic === o ? "on" : ""} onClick={() => patch({ organic: o })}>{o}</button>
              ))}
            </div>
          </Field>
          <Field label="Certifications held" full>
            <div className="d-flex flex-wrap gap-2">
              {CERTS.map((c) => (
                <button key={c} type="button" className={`gm-chipbtn ${profile.certs.includes(c) ? "on" : ""}`} onClick={() => toggleCert(c)}>
                  {profile.certs.includes(c) && <Check width={13} height={13} />} {c}
                </button>
              ))}
            </div>
          </Field>
          {LABOUR_MODELS.map((l) => (
            <button key={l.id} type="button" className={`gm-checkcard ${profile.labour === l.id ? "on" : ""}`} onClick={() => patch({ labour: l.id })}>
              <input type="radio" checked={profile.labour === l.id} readOnly tabIndex={-1} />
              <span><strong>{l.label}</strong><small>{l.desc}</small></span>
            </button>
          ))}
        </div>
      </div>

      <div className="gm-card p-3 p-md-4">
        <h3 style={{ fontSize: "1rem" }}><Users width={17} height={17} /> Market, risk &amp; group</h3>
        <div className="gm-form-grid">
          <Field label="Where do you sell?">
            <select className="gm-select" value={profile.marketPref} onChange={(e) => patch({ marketPref: e.target.value })}>
              <option value="">Select…</option>{MARKET_PREFS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Risk appetite">
            <div className="gm-seg" role="radiogroup">
              {RISKS.map((r) => (
                <button key={r.id} type="button" title={r.desc} role="radio" aria-checked={profile.risk === r.id}
                  className={profile.risk === r.id ? "on" : ""} onClick={() => patch({ risk: r.id })}>{r.label}</button>
              ))}
            </div>
          </Field>
          <Field label="Join a farmer group?" full>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <div className="gm-seg" role="radiogroup">
                <button type="button" role="radio" aria-checked={profile.joinGroup === "Yes"} className={profile.joinGroup === "Yes" ? "on" : ""}
                  onClick={() => { patch({ joinGroup: "Yes" }); onGroups(); }}>Yes</button>
                <button type="button" role="radio" aria-checked={profile.joinGroup === "No"} className={profile.joinGroup === "No" ? "on" : ""}
                  onClick={() => patch({ joinGroup: "No", groupId: null })}>No</button>
              </div>
              {group ? (
                <span className="gm-chip gm-chip-lime"><Check width={13} height={13} /> {group.name} · {group.members + 1} members</span>
              ) : profile.joinGroup === "Yes" ? (
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onGroups}>Browse groups</button>
              ) : null}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}

function GroupFinder({ groupId, onJoin, onLeave }: { groupId: string | null; onJoin: (id: string) => void; onLeave: () => void }) {
  const [q, setQ] = useState("");
  const rows = FARMER_GROUPS.filter((g) => `${g.name} ${g.ward} ${g.focus}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="gm-form-grid mb-2">
        <Field label="Search by name, ward or focus" full>
          <input className="gm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. dairy, Githunguri…" />
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead><tr><th>Group</th><th>Ward</th><th>Members</th><th>Focus</th><th>Distance</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id}>
                <td><strong>{g.name}</strong></td>
                <td>{g.ward}</td>
                <td>{g.members + (groupId === g.id ? 1 : 0)}</td>
                <td>{g.focus}</td>
                <td>{g.distKm} km</td>
                <td style={{ textAlign: "right" }}>
                  {groupId === g.id ? (
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onLeave}>Leave</button>
                  ) : (
                    <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onJoin(g.id)}>Join</button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6}>No groups match "{q}".</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= step 7: M-Pesa ================= */
function StepMpesa({ profile, patch, onVerify, onBank, onPin, onAutopay }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void;
  onVerify: () => void; onBank: () => void; onPin: () => void; onAutopay: () => void;
}) {
  return (
    <div>
      <div className="gm-card p-3 p-md-4 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h2 className="mb-0" style={{ fontSize: "1.15rem", flex: "1 1 220px" }}><Smartphone width={18} height={18} /> M-Pesa payouts</h2>
          {profile.mpesaVerified
            ? <span className="gm-chip gm-chip-lime"><BadgeCheck width={13} height={13} /> Verified</span>
            : <span className="gm-chip gm-chip-gold"><TriangleAlert width={13} height={13} /> Not verified</span>}
        </div>
        <div className="gm-form-grid">
          <Field label="M-Pesa number">
            <input className="gm-input" inputMode="tel" value={profile.mpesa}
              onChange={(e) => patch({ mpesa: e.target.value.replace(/[^\d]/g, "").slice(0, 10), mpesaVerified: false })} placeholder="0712 345 678" />
          </Field>
          <Field label="Registered name (as on ID)">
            <input className="gm-input" value={profile.mpesaName} onChange={(e) => patch({ mpesaName: e.target.value.toUpperCase(), mpesaVerified: false })} placeholder="MARY WANJIKU" />
          </Field>
          <div className="full">
            <button type="button" className="gm-btn gm-btn-mpesa" disabled={!profile.mpesa || !profile.mpesaName} onClick={onVerify}>
              {profile.mpesaVerified ? <><RefreshCw /> Re-verify</> : <><ShieldCheck /> Verify M-Pesa</>}
            </button>
          </div>
        </div>
      </div>

      <div className="gm-card p-3 p-md-4 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h3 className="mb-0" style={{ fontSize: "1rem", flex: "1 1 220px" }}><Landmark width={17} height={17} /> Bank account <small style={{ fontWeight: 600, color: "var(--gm-ink-400)" }}>(optional)</small></h3>
          {profile.bankVerified && <span className="gm-chip gm-chip-lime"><BadgeCheck width={13} height={13} /> Verified</span>}
        </div>
        {profile.bankName ? (
          <div className="gm-checkcard on" style={{ cursor: "default" }}>
            <Building2 color="var(--gm-leaf-700)" />
            <span style={{ flex: 1 }}>
              <strong>{profile.bankName} ····{profile.bankAccount.slice(-4) || "––––"}</strong>
              <small>{profile.bankBranch || "No branch set"}</small>
            </span>
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onBank}><Pencil width={14} height={14} /> Edit</button>
          </div>
        ) : (
          <button type="button" className="gm-btn gm-btn-outline" onClick={onBank}><Plus /> Add bank account</button>
        )}
      </div>

      <div className="gm-card p-3 p-md-4">
        <h3 style={{ fontSize: "1rem" }}><Lock width={17} height={17} /> Wallet security</h3>
        <div className="gm-form-grid">
          <div>
            <span className="gm-field-label">Wallet PIN</span>
            <button type="button" className="gm-btn gm-btn-dark" onClick={onPin}>
              <KeyRound /> {profile.walletPinSet ? "Change PIN" : "Set 4-digit PIN"}
            </button>
            {profile.walletPinSet && <p className="mb-0 mt-1" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gm-leaf-700)" }}><Check width={13} height={13} /> PIN active</p>}
          </div>
          <div>
            <Toggle checked={profile.autopay} onChange={(v) => patch({ autopay: v })}
              label="Auto-pay bills" desc="Repay input loans automatically" />
            <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm mt-1" onClick={onAutopay}>
              Auto-pay rules {profile.autopay && profile.autopayLimit ? <span className="gm-chip" style={{ marginLeft: 4 }}>≤ {kes(Number(profile.autopayLimit))}</span> : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MpesaWizard({ profile, patch, onDone }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; onDone: () => void;
}) {
  const [ws, setWs] = useState(0);
  const [code, setCode] = useState("");
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const cd = useCountdown(30);
  const match = profile.mpesaName.trim().toUpperCase() === profile.name.trim().toUpperCase() && !!profile.name.trim();

  const send = () => {
    setCode(String(Math.floor(1000 + Math.random() * 9000)));
    setVal(""); setErr(""); cd.start(30); setWs(1);
  };
  const verify = () => {
    if (val === code && code) setWs(2);
    else setErr("Wrong code — check the SMS and retry.");
  };

  return (
    <div>
      <div className="gm-wsteps"><span className={ws >= 0 ? "on" : ""} /><span className={ws >= 1 ? "on" : ""} /><span className={ws >= 2 ? "on" : ""} /></div>
      {ws === 0 && (
        <div>
          <p style={{ fontSize: "0.9rem" }}>We'll send a code to <strong>{profile.mpesa}</strong> and match the registered name against your ID.</p>
          <div className="p-3 mb-3" style={{ background: "var(--gm-mint-50)", borderRadius: 14, fontSize: "0.88rem" }}>
            <div className="d-flex justify-content-between"><span>M-Pesa name</span><strong>{profile.mpesaName || "—"}</strong></div>
            <div className="d-flex justify-content-between"><span>ID name</span><strong>{profile.name || "—"}</strong></div>
          </div>
          <button type="button" className="gm-btn gm-btn-mpesa" onClick={send}>Send verification code</button>
        </div>
      )}
      {ws === 1 && (
        <div>
          <div className="p-3 mb-2" style={{ background: "var(--gm-mint-100)", borderRadius: 14, fontSize: "0.85rem", fontWeight: 700 }}>
            <Info width={15} height={15} /> Demo SMS — your code is <span className="font-display" style={{ fontSize: "1.2rem", letterSpacing: 2 }}>{code.split("").join(" ")}</span>
          </div>
          <OtpInput length={4} value={val} onChange={(v) => { setVal(v); setErr(""); }} label="M-Pesa code" />
          {err && <div className="gm-ferr">{err}</div>}
          <div className="d-flex gap-2 mt-2">
            <button type="button" className="gm-btn gm-btn-outline" disabled={cd.running} onClick={send}>
              {cd.running ? `Resend in ${cd.mmss}` : "Resend"}
            </button>
            <button type="button" className="gm-btn gm-btn-lime" disabled={val.length < 4} onClick={verify}>Verify</button>
          </div>
        </div>
      )}
      {ws === 2 && (
        <div className="text-center">
          {match ? (
            <>
              <CheckCircle2 width={44} height={44} color="var(--gm-leaf-600)" />
              <h3 style={{ fontSize: "1.1rem" }}>Names match</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--gm-ink-700)" }}><strong>{profile.mpesaName}</strong> matches your ID. Payouts to <strong>{profile.mpesa}</strong> are unlocked up to KES 500K/day.</p>
            </>
          ) : (
            <>
              <TriangleAlert width={44} height={44} color="var(--gm-gold-500)" />
              <h3 style={{ fontSize: "1.1rem" }}>Names differ slightly</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--gm-ink-700)" }}>M-Pesa says <strong>{profile.mpesaName}</strong> but your ID says <strong>{profile.name || "—"}</strong>. We'll verify manually within 24 hours — small payouts work meanwhile.</p>
            </>
          )}
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { patch({ mpesaVerified: true }); onDone(); }}>
            Finish verification
          </button>
        </div>
      )}
    </div>
  );
}

function BankForm({ profile, patch, onDone, onClose }: {
  profile: FarmProfile; patch: (p: Partial<FarmProfile>) => void; onDone: () => void; onClose: () => void;
}) {
  const [bank, setBank] = useState(profile.bankName);
  const [branch, setBranch] = useState(profile.bankBranch);
  const [acct, setAcct] = useState(profile.bankAccount);
  const [err, setErr] = useState("");
  const ok = bank && branch.trim() && acct.replace(/\D/g, "").length >= 6;

  return (
    <div className="gm-form-grid">
      <Field label="Bank">
        <select className="gm-select" value={bank} onChange={(e) => setBank(e.target.value)}>
          <option value="">Select…</option>{BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Branch">
        <input className="gm-input" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Githunguri" />
      </Field>
      <Field label="Account number" full>
        <input className="gm-input" inputMode="numeric" value={acct} onChange={(e) => { setAcct(e.target.value.replace(/[^\d]/g, "").slice(0, 16)); setErr(""); }} placeholder="6+ digits" />
        {err && <div className="gm-ferr">{err}</div>}
      </Field>
      <div className="full">
        <FooterBar>
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="gm-btn gm-btn-lime" disabled={!ok}
            onClick={() => {
              if (acct.replace(/\D/g, "").length < 6) { setErr("Account numbers have at least 6 digits."); return; }
              patch({ bankName: bank, bankBranch: branch.trim(), bankAccount: acct, bankVerified: true });
              onDone();
            }}>
            Verify account
          </button>
        </FooterBar>
      </div>
    </div>
  );
}

function PinSetup({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"new" | "confirm">("new");
  const [first, setFirst] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [err, setErr] = useState("");

  return (
    <div className="text-center">
      <p style={{ fontWeight: 800 }}>{phase === "new" ? "Enter a new 4-digit PIN" : "Repeat the PIN to confirm"}</p>
      {err && <div className="gm-ferr mb-2">{err}</div>}
      <PinPad length={4} resetKey={resetKey} actionLabel={phase === "new" ? "You'll confirm it next" : "Must match the first entry"}
        onComplete={(pin) => {
          if (phase === "new") {
            if (new Set(pin).size === 1) { setErr("Too easy — don't use 4 identical digits."); setResetKey((k) => k + 1); return; }
            setFirst(pin); setPhase("confirm"); setResetKey((k) => k + 1);
          } else if (pin === first) onDone();
          else { setErr("PINs don't match — start over."); setPhase("new"); setResetKey((k) => k + 1); }
        }} />
    </div>
  );
}

function AutopayForm({ limit, onSave, onClose }: { limit: string; onSave: (v: string) => void; onClose: () => void }) {
  const [v, setV] = useState(limit || "5000");
  return (
    <div>
      <ul style={{ paddingLeft: "1.1rem", fontSize: "0.88rem", display: "grid", gap: "0.4rem" }}>
        <li>Auto-repays input loans on due date from your M-Pesa float</li>
        <li>You approve anything above your limit by PIN first</li>
        <li>SMS receipt for every auto-payment, instantly</li>
      </ul>
      <Field label="Auto-approve up to (KES)">
        <input className="gm-input" style={{ maxWidth: 240 }} inputMode="numeric" value={v} onChange={(e) => setV(e.target.value.replace(/[^\d]/g, "").slice(0, 7))} />
      </Field>
      <p className="font-display" style={{ fontSize: "1.05rem" }}>≈ {kes(Number(v) || 0)}</p>
      <FooterBar>
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!Number(v)} onClick={() => onSave(v)}>Enable auto-pay</button>
      </FooterBar>
    </div>
  );
}

/* ================= review wizard ================= */
function ReviewWizard({ profile, scores, aezCode, onDone }: {
  profile: FarmProfile; scores: number[]; aezCode: string; onDone: () => void;
}) {
  const [ws, setWs] = useState(0);
  const [decls, setDecls] = useState([false, false, false]);
  const all = decls.every(Boolean);
  const toggle = (i: number) => setDecls((d) => d.map((x, j) => (j === i ? !x : x)));

  const row = (k: string, v: string) => (
    <tr key={k}><td style={{ color: "var(--gm-ink-400)" }}>{k}</td><td><strong>{v}</strong></td></tr>
  );

  return (
    <div>
      <div className="gm-wsteps"><span className={ws >= 0 ? "on" : ""} /><span className={ws >= 1 ? "on" : ""} /><span className={ws >= 2 ? "on" : ""} /></div>
      {ws === 0 && (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              {row("Farmer", `${profile.name || "—"} · ${profile.phone}${profile.phoneVerified ? " (verified)" : ""}`)}
              {row("ID", profile.idNumber || "—")}
              {row("Farm", `${profile.farmName || "—"} — ${profile.village || "—"}, ${profile.ward || "—"}, ${profile.sub || "—"}, ${profile.county || "—"}`)}
              {row("GPS", profile.gps ? `${profile.gps.lat}, ${profile.gps.lng}` : "Not captured")}
              {row("AEZ zone", aezCode)}
              {row("Plots", `${profile.plots.length} plots · ${profile.plots.reduce((a, p) => a + (Number(p.size) || 0), 0)} acres`)}
              {row("Step scores", `Phone ${scores[0]}% · Identity ${scores[1]}% · Location ${scores[2]}%`)}
            </tbody>
          </table>
        </div>
      )}
      {ws === 1 && (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              {row("Soil forms", `${scores[3]}% filled across ${profile.plots.length} plots`)}
              {row("Assets", `${profile.assets.length} items + ${profile.livestock.length} livestock lines`)}
              {row("Asset value", kes(profile.assets.reduce((a, r) => a + r.qty * r.value, 0) + profile.livestock.reduce((a, r) => a + r.count * r.value, 0)))}
              {row("History", profile.historySkipped ? "Skipped" : `${profile.seasons.length} seasons recorded`)}
              {row("Goal", `${GOALS.find((g) => g.id === profile.goal)?.label ?? "—"} · ${profile.targetIncome ? kes(Number(profile.targetIncome)) : "no target"} · ${profile.prefCrops.join(", ") || "no crops"}`)}
              {row("M-Pesa", `${profile.mpesa || "—"}${profile.mpesaVerified ? " (verified)" : ""} · PIN ${profile.walletPinSet ? "set" : "missing"}`)}
            </tbody>
          </table>
        </div>
      )}
      {ws === 2 && (
        <div className="d-grid gap-2">
          {[
            "My details are true — I understand wrong ID or M-Pesa names delay payouts.",
            "I agree GrowMO may SMS or call me about weather, prices and repayments.",
            "I understand this demo stores my data only in this browser.",
          ].map((t, i) => (
            <button key={t} type="button" className={`gm-checkcard ${decls[i] ? "on" : ""}`} onClick={() => toggle(i)}>
              <input type="checkbox" checked={decls[i]} readOnly tabIndex={-1} />
              <span><strong style={{ fontWeight: 600, fontSize: "0.86rem" }}>{t}</strong></span>
            </button>
          ))}
        </div>
      )}
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline" disabled={ws === 0} onClick={() => setWs(ws - 1)}><ChevronLeft /> Back</button>
        {ws < 2 ? (
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => setWs(ws + 1)}>Continue <ChevronRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime" disabled={!all} onClick={onDone}>
            <BadgeCheck /> Complete profile
          </button>
        )}
      </div>
    </div>
  );
}

