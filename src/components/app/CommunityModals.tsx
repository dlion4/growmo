/* ============================================================================
   PAGE 13 WORKFLOWS — forums, extension library, agronomist connect, farmer
   groups, success stories and peer benchmarking.

   Every dialog completes a real action: a posted thread or reply, a saved
   resource, an offline bundle request, a booked agronomist service, a group
   joining paid by M-Pesa, a bulk order, an event registration or a settings
   change. Nothing here is a placeholder button.
   ========================================================================== */
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Handshake,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Sprout,
  ThumbsUp,
  TriangleAlert,
  Truck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  Agronomist,
  AgroSession,
  BenchmarkMetric,
  FarmerGroup,
  ForumCategory,
  ForumThread,
  GroupContribution,
  GroupEvent,
  GroupOrderItem,
  LibraryResource,
  SuccessStory,
} from "../../data/app/community";
import {
  AGRONOMIST_SERVICES,
  AGRONOMISTS,
  COMMUNITY_CONTEXT,
  COMMUNITY_SETTINGS,
  FARMER_GROUPS,
  FORUM_CATEGORIES,
  GROUP_ORDER_ITEMS,
  LIBRARY_CATEGORIES,
  PEER_GROUPS,
} from "../../data/app/community";
import { kes } from "../../data/site";
import { Dialog, OtpInput, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

const CROP_KEYWORDS = [
  { crop: "Cabbage Gloria F1", keyword: "horticulture" },
  { crop: "Tomato Roma VF", keyword: "horticulture" },
  { crop: "Kale Thousand Headed", keyword: "horticulture" },
  { crop: "Maize H6213", keyword: "cereal" },
  { crop: "Potato Shangi", keyword: "potato" },
  { crop: "Dairy herd", keyword: "livestock" },
];

function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`gm-field ${className}`}>
      <span className="gm-field-label">{label}</span>
      {children}
      {hint ? <small className="text-muted d-block mt-1">{hint}</small> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="gm-input"
      value={value}
      type={type}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type SelectOption = string | { value: string; label: string };

/* Read-only value shown in an input shell — used for details the member cannot edit. */
function StaticField({ value }: { value: string }) {
  return <input className="gm-input" value={value} readOnly aria-readonly="true" />;
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <select
      className="gm-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => {
        const item =
          typeof option === "string"
            ? { value: option, label: option }
            : option;
        return (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        );
      })}
    </select>
  );
}

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Callout({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="gm-cm-callout">
      <Icon />
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
    </div>
  );
}

function SuccessState({
  title,
  body,
  receipt,
  actionLabel,
  onDone,
}: {
  title: string;
  body: string;
  receipt?: string;
  actionLabel: string;
  onDone: () => void;
}) {
  return (
    <div className="gm-cm-stack">
      <div className="gm-cm-success">
        <span className="gm-cm-success-mark">
          <CheckCircle2 />
        </span>
        <h4 className="font-display mb-1">{title}</h4>
        <p className="text-muted mb-2">{body}</p>
        {receipt ? (
          <div className="gm-cm-receipt">
            <small>M-Pesa reference</small>
            <strong>{receipt}</strong>
          </div>
        ) : null}
      </div>
      <button type="button" className="gm-btn gm-btn-lime w-100" onClick={onDone}>
        {actionLabel}
      </button>
    </div>
  );
}

/* Shared M-Pesa style payment panel used by paid community flows. */
function PayPanel({
  amount,
  purpose,
  payee,
  onPaid,
}: {
  amount: number;
  purpose: string;
  payee: string;
  onPaid: (receipt: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");

  useEffect(() => {
    setOtp("");
    setReceipt("");
    setProcessing(false);
  }, [amount, purpose]);

  if (receipt) {
    return (
      <SuccessState
        title="Payment confirmed"
        body={`${kes(amount)} paid for ${purpose}.`}
        receipt={receipt}
        actionLabel="Continue"
        onDone={() => onPaid(receipt)}
      />
    );
  }

  return (
    <div className="gm-cm-stack">
      <div className="gm-cm-pay">
        <Smartphone />
        <span>
          <strong>
            {kes(amount)} to {payee}
          </strong>
          <small>M-Pesa {COMMUNITY_CONTEXT.phone} · GrowMO wallet · charges covered</small>
        </span>
      </div>
      {processing ? (
        <div className="gm-cm-processing">
          <LoaderCircle />
          <strong>Waiting for M-Pesa confirmation…</strong>
          <small>Keep the app open. A receipt appears the moment it clears.</small>
        </div>
      ) : (
        <>
          <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP (demo: 123456)" />
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={() => setOtp("123456")}
          >
            Use demo OTP
          </button>
        </>
      )}
      <button
        type="button"
        className="gm-btn gm-btn-lime w-100"
        disabled={otp.length !== 6 || processing}
        onClick={() => {
          setProcessing(true);
          window.setTimeout(() => {
            setProcessing(false);
            setReceipt(`QK${(amount * 3) % 9971}PL${purpose.length % 9}`);
          }, 1200);
        }}
      >
        <LockKeyhole /> Confirm payment
      </button>
      <small className="text-center text-muted">
        Simulated M-Pesa confirmation — no real money moves in this demo.
      </small>
    </div>
  );
}

/* =============================== 1. FORUMS ============================== */

export function NewThreadWizard({
  open,
  defaultCategory,
  onClose,
  onPosted,
}: {
  open: boolean;
  defaultCategory?: string;
  onClose: () => void;
  onPosted: (title: string, category: string, language: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(defaultCategory ?? FORUM_CATEGORIES[0].name);
  const [subForum, setSubForum] = useState(FORUM_CATEGORIES[0].subForums[0]);
  const [language, setLanguage] = useState("EN");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [photo, setPhoto] = useState(false);
  const [county, setCounty] = useState("Kiambu");
  const [busy, setBusy] = useState(false);
  const steps = ["Category", "Write it", "Publish"];

  const categoryEntry =
    FORUM_CATEGORIES.find((item) => item.name === category) ?? FORUM_CATEGORIES[0];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setTitle("");
    setBody("");
    setTags([]);
    setPhoto(false);
    setBusy(false);
    const preset = FORUM_CATEGORIES.find((item) => item.name === defaultCategory);
    if (preset) {
      setCategory(preset.name);
      setSubForum(preset.subForums[0]);
    }
  }, [open, defaultCategory]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Start a discussion"
      desc="A clear title and a photo get answered three times faster."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-cm-stack">
          <div className="gm-form-grid">
            <Field label="Forum category">
              <SelectInput
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  const next = FORUM_CATEGORIES.find((item) => item.name === value);
                  if (next) setSubForum(next.subForums[0]);
                }}
                options={FORUM_CATEGORIES.map((item) => item.name)}
              />
            </Field>
            <Field label="Sub-forum">
              <SelectInput
                value={subForum}
                onChange={setSubForum}
                options={categoryEntry.subForums}
              />
            </Field>
            <Field label="Language">
              <SelectInput
                value={language}
                onChange={setLanguage}
                options={["EN", "Kiswahili (SW)", "Mixed EN + SW"]}
              />
            </Field>
            <Field label="Your county">
              <SelectInput
                value={county}
                onChange={setCounty}
                options={["Kiambu", "Nairobi", "Nakuru", "Kisumu", "Uasin Gishu", "Machakos"]}
              />
            </Field>
          </div>
          <Callout
            icon={MessageCircle}
            title={`${categoryEntry.members.toLocaleString("en-KE")} members in ${category}`}
            body={`${categoryEntry.threads} active threads. Choose the closest sub-forum so the right people see it.`}
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Write the post"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-cm-stack">
          <Field
            label="Title"
            hint="Name the crop, the county and the problem in one line."
          >
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="e.g. Black rot kwa cabbage Kiambu — nifanye nini?"
            />
          </Field>
          <Field label="Your question or update" hint="Numbers help: acreage, plant counts, days.">
            <textarea
              className="gm-textarea"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Describe what you have seen, what you have tried, and what you need."
            />
          </Field>
          <div>
            <span className="gm-field-label">Tags</span>
            <div className="d-flex flex-wrap gap-2">
              {["black rot", "aphids", "fall armyworm", "market", "irrigation", "organic", "seed"].map(
                (tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      className={`gm-filter-chip ${active ? "is-active" : ""}`}
                      onClick={() =>
                        setTags((current) =>
                          active ? current.filter((item) => item !== tag) : [...current, tag],
                        )
                      }
                    >
                      #{tag}
                    </button>
                  );
                },
              )}
            </div>
          </div>
          <Toggle
            checked={photo}
            onChange={setPhoto}
            label="Attach a photo"
            desc="Pest and disease identification is far more accurate with a close-up."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Review & publish"
            nextDisabled={title.trim().length < 8 || body.trim().length < 20}
          />
        </div>
      ) : (
        <div className="gm-cm-stack">
          <div className="gm-cm-review">
            <ReviewRow label="Category" value={`${category} · ${subForum}`} />
            <ReviewRow label="Language" value={language} />
            <ReviewRow label="County" value={county} />
            <ReviewRow label="Tags" value={tags.length ? tags.map((tag) => `#${tag}`).join(" ") : "none"} />
            <ReviewRow label="Photo" value={photo ? "plot-photo.jpg attached" : "None"} />
          </div>
          <Callout icon={MessageCircle} title={title || "Untitled thread"} body={body} />
          {busy ? (
            <div className="gm-cm-processing">
              <LoaderCircle />
              <strong>Posting to the forum…</strong>
              <small>Notifying farmers following {category}.</small>
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              setBusy(true);
              window.setTimeout(() => {
                setBusy(false);
                onPosted(title, category, language);
                onClose();
              }, 900);
            }}
            finishLabel="Publish thread"
            nextDisabled={busy}
          />
        </div>
      )}
    </Dialog>
  );
}

export function ThreadDetailDialog({
  open,
  thread,
  onClose,
  onReply,
  onLike,
  onMarkBest,
  onReport,
  onAskExpert,
}: {
  open: boolean;
  thread: ForumThread | null;
  onClose: () => void;
  onReply: (thread: ForumThread, body: string, photo: boolean) => void;
  onLike: (thread: ForumThread, replyId?: string) => void;
  onMarkBest: (thread: ForumThread, replyId: string) => void;
  onReport: (thread: ForumThread) => void;
  onAskExpert: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState(false);

  useEffect(() => {
    setDraft("");
    setPhoto(false);
  }, [thread?.id]);

  if (!thread) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={thread.title}
      desc={`${thread.category} · ${thread.subForum} · posted by ${thread.author} (${thread.handle}) on ${thread.posted}`}
    >
      <div className="gm-cm-stack">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <StatusChip label={thread.language === "SW" ? "Kiswahili" : thread.language === "EN" ? "English" : "EN + SW"} tone="neutral" />
          <StatusChip label={`${thread.views.toLocaleString("en-KE")} views`} tone="neutral" />
          <StatusChip label={`${thread.likes} likes`} tone="low" />
          {thread.solved ? <StatusChip label="Solved" tone="low" /> : <StatusChip label="Open" tone="medium" />}
        </div>
        <p style={{ fontSize: "0.9rem" }}>{thread.body}</p>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={() => onLike(thread)}>
            <ThumbsUp /> Helpful ({thread.likes})
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onAskExpert}>
            <BadgeCheck /> Ask a verified agronomist
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onReport(thread)}>
            <TriangleAlert /> Report thread
          </button>
        </div>
        <div>
          <span className="gm-eyebrow">{thread.replies.length} replies</span>
          <div className="gm-cm-thread-full mt-2">
            {thread.replies.map((reply) => (
              <div
                className={`gm-cm-reply ${reply.verified ? "is-verified" : ""}`}
                key={reply.id}
              >
                <span className="gm-cm-msg-ava">
                  {reply.author.slice(0, 2).toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>
                    {reply.author} {reply.verified ? <BadgeCheck /> : null}
                  </strong>
                  <small>
                    {reply.handle} · {reply.role} · {reply.county} · {reply.posted}
                  </small>
                  <p>{reply.body}</p>
                  {reply.photo ? (
                    <span className="gm-chip gm-chip-ghost mt-2">
                      <Printer /> {reply.photo}
                    </span>
                  ) : null}
                  <div className="gm-cm-reply-foot">
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onLike(thread, reply.id)}
                    >
                      <ThumbsUp /> {reply.likes}
                    </button>
                    {reply.verified && !thread.solved ? (
                      <button
                        type="button"
                        className="gm-btn gm-btn-lime gm-btn-sm"
                        onClick={() => onMarkBest(thread, reply.id)}
                      >
                        <CheckCircle2 /> Mark as best answer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Field label="Add your reply" hint="Be specific — what worked on your farm, and what it cost.">
          <textarea
            className="gm-textarea"
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. Nimerukia Mancozeb 50 g/20 L kila siku 14, na nimeongeza spacing."
          />
        </Field>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <button
            type="button"
            className={`gm-filter-chip ${photo ? "is-active" : ""}`}
            onClick={() => setPhoto(!photo)}
          >
            {photo ? "Photo attached" : "Attach a photo"}
          </button>
          <div className="d-flex gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={draft.trim().length < 8}
              onClick={() => {
                onReply(thread, draft.trim(), photo);
                setDraft("");
                setPhoto(false);
              }}
            >
              <Send /> Post reply
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export function ReportContentDialog({
  open,
  thread,
  onClose,
  onReported,
}: {
  open: boolean;
  thread: ForumThread | null;
  onClose: () => void;
  onReported: (reason: string) => void;
}) {
  const [reason, setReason] = useState("Misleading advice");
  const [note, setNote] = useState("");
  const [escalate, setEscalate] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNote("");
    setEscalate(false);
  }, [open]);

  if (!thread) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Report this content"
      desc="Reports are reviewed by the moderation team and verified agronomists."
    >
      <div className="gm-cm-stack">
        <Field label="Reason">
          <SelectInput
            value={reason}
            onChange={setReason}
            options={[
              "Misleading advice",
              "Unsafe pesticide advice",
              "Spam or advertising",
              "Abusive language",
              "Wrong category",
            ]}
          />
        </Field>
        <Field label="What should the moderators know?">
          <textarea
            className="gm-textarea"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. The product named is not registered for cabbage in Kenya."
          />
        </Field>
        <Toggle
          checked={escalate}
          onChange={setEscalate}
          label="Ask a verified agronomist to reply publicly"
          desc="Useful when the advice concerns pesticide safety or a pre-harvest interval."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            disabled={note.trim().length < 8}
            onClick={() => {
              onReported(`${reason}${escalate ? " · agronomist escalation requested" : ""}`);
              onClose();
            }}
          >
            <AlertTriangle /> Submit report
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ========================= 2. EXTENSION LIBRARY ========================= */

export function ResourcePreviewDialog({
  open,
  resource,
  onClose,
  onDownload,
  onBookmark,
  onRequestOffline,
}: {
  open: boolean;
  resource: LibraryResource | null;
  onClose: () => void;
  onDownload: (resource: LibraryResource) => void;
  onBookmark: (resource: LibraryResource) => void;
  onRequestOffline: (resource: LibraryResource) => void;
}) {
  if (!resource) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={resource.title}
      desc={`${resource.source} · ${resource.year} · ${resource.length} · ${resource.size}`}
    >
      <div className="gm-cm-stack">
        <div className="d-flex flex-wrap gap-2">
          <StatusChip label={resource.format} tone="low" />
          <StatusChip label={resource.language} tone="neutral" />
          <StatusChip label={`★ ${resource.rating}`} tone="medium" />
          <StatusChip label={`${resource.downloads.toLocaleString("en-KE")} downloads`} tone="neutral" />
        </div>
        <p className="mb-0" style={{ fontSize: "0.9rem" }}>
          {resource.summary}
        </p>
        <div>
          <span className="gm-eyebrow">Inside this resource</span>
          <ul className="gm-check-list">
            {resource.chapters.map((chapter) => (
              <li key={chapter}>{chapter}</li>
            ))}
          </ul>
        </div>
        <div className="gm-cm-review">
          <ReviewRow label="Category" value={resource.category} />
          <ReviewRow label="Source" value={resource.source} />
          <ReviewRow label="Region" value={resource.county} />
          <ReviewRow label="SMS code" value={resource.smsCode} />
        </div>
        <Callout
          icon={Sprout}
          title="Works offline"
          body={`Text ${resource.smsCode} to 40401 for a light version, or save it to your phone now.`}
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={() => onBookmark(resource)}>
            Save to library
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => onRequestOffline(resource)}>
            <Phone /> Request offline bundle
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onDownload(resource)}>
            <Download /> Download now
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ResourceRequestDialog({
  open,
  resource,
  onClose,
  onRequested,
}: {
  open: boolean;
  resource: LibraryResource | null;
  onClose: () => void;
  onRequested: (resource: LibraryResource, channel: string) => void;
}) {
  const [channel, setChannel] = useState("SMS code");
  const [phone, setPhone] = useState(COMMUNITY_CONTEXT.phone);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setDone(false);
  }, [open]);

  if (!resource) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Get this resource offline"
      desc={`${resource.title} · ${resource.size}`}
    >
      {done ? (
        <SuccessState
          title="Bundle requested"
          body={`The light version of “${resource.title}” will reach ${phone} within 15 minutes via ${channel}.`}
          actionLabel="Done"
          onDone={onClose}
        />
      ) : (
        <div className="gm-cm-stack">
          <div>
            <span className="gm-field-label">Delivery channel</span>
            <div className="d-flex flex-wrap gap-2">
              {["SMS code", "WhatsApp link", "Wi-Fi download at the group hub", "SD card copy"].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    className={`gm-filter-chip ${channel === item ? "is-active" : ""}`}
                    onClick={() => setChannel(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
          <Field label="Phone number">
            <TextInput value={phone} onChange={setPhone} />
          </Field>
          <Callout
            icon={Phone}
            title={`SMS code: ${resource.smsCode} to 40401`}
            body="The compressed text version costs no data and works on a feature phone."
          />
          {busy ? (
            <div className="gm-cm-processing">
              <LoaderCircle />
              <strong>Queueing the bundle…</strong>
              <small>You will get an SMS when it is ready.</small>
            </div>
          ) : null}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={busy || phone.trim().length < 9}
              onClick={() => {
                setBusy(true);
                window.setTimeout(() => {
                  setBusy(false);
                  setDone(true);
                  onRequested(resource, channel);
                }, 900);
              }}
            >
              <Send /> Request bundle
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function BookmarkDialog({
  open,
  resource,
  onClose,
  onSaved,
}: {
  open: boolean;
  resource: LibraryResource | null;
  onClose: () => void;
  onSaved: (resource: LibraryResource, folder: string) => void;
}) {
  const [folder, setFolder] = useState("Season LR 2026");
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    if (!open) return;
    setNotify(true);
  }, [open]);

  if (!resource) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Save to your library"
      desc={resource.title}
    >
      <div className="gm-cm-stack">
        <Field label="Folder">
          <SelectInput
            value={folder}
            onChange={setFolder}
            options={[
              "Season LR 2026",
              "Spray and PHI reference",
              "Group training material",
              "Certification evidence",
            ]}
          />
        </Field>
        <Toggle
          checked={notify}
          onChange={setNotify}
          label="Tell me when this resource is updated"
          desc="KALRO revises guides after each season."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onSaved(resource, folder);
              onClose();
            }}
          >
            <ClipboardCheck /> Save resource
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ========================= 3. AGRONOMIST CONNECT ======================== */

export function AgronomistRequestWizard({
  open,
  presetService,
  presetAgronomist,
  onClose,
  onBooked,
}: {
  open: boolean;
  presetService?: string;
  presetAgronomist?: Agronomist | null;
  onClose: () => void;
  onBooked: (
    summary: {
      agronomist: string;
      service: string;
      channel: string;
      cost: number;
      receipt: string;
      date: string;
    },
  ) => void;
}) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(presetService ?? AGRONOMIST_SERVICES[0].id);
  const [agronomistId, setAgronomistId] = useState(presetAgronomist?.id ?? AGRONOMISTS[0].id);
  const [crop, setCrop] = useState(CROP_KEYWORDS[0].crop);
  const [urgency, setUrgency] = useState("Within 24 hours");
  const [details, setDetails] = useState(
    "V-shaped yellow lesions with black veins on Plot 1 cabbage, about 4 plants affected after heavy rain.",
  );
  const [photo, setPhoto] = useState(true);
  const [useFree, setUseFree] = useState(true);
  const [date, setDate] = useState("2026-09-21");
  const steps = ["Service", "Agronomist", "Your issue", "Confirm"];

  const service = AGRONOMIST_SERVICES.find((item) => item.id === serviceId) ?? AGRONOMIST_SERVICES[0];
  const agronomist = AGRONOMISTS.find((item) => item.id === agronomistId) ?? AGRONOMISTS[0];
  const keyword =
    CROP_KEYWORDS.find((item) => item.crop === crop)?.keyword ?? "";
  const matching = AGRONOMISTS.filter((item) =>
    item.speciality.toLowerCase().includes(keyword),
  );
  const shortlist = matching.length > 0 ? matching : AGRONOMISTS;
  const payable =
    useFree && (service.id === "svc-1" || service.id === "svc-2")
      ? 0
      : service.cost || agronomist.fee;

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setUseFree(true);
    if (presetService) setServiceId(presetService);
    if (presetAgronomist) setAgronomistId(presetAgronomist.id);
  }, [open, presetService, presetAgronomist]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Request agronomist support"
      desc="Two chat sessions and three photo diagnoses are free every month."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-cm-stack">
          <div className="d-flex flex-column gap-2">
            {AGRONOMIST_SERVICES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`gm-checkcard ${serviceId === item.id ? "on" : ""}`}
                onClick={() => setServiceId(item.id)}
              >
                <input type="radio" checked={serviceId === item.id} readOnly tabIndex={-1} />
                <span>
                  <strong>{item.label}</strong>
                  <small>
                    {item.detail} · free allowance: {item.free} ·{" "}
                    {item.cost === 0 ? "free" : `KES ${item.cost} ${item.unit}`} · {item.days}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Choose an agronomist"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-cm-stack">
          <Field
            label="Which crop or enterprise needs help?"
            hint={
              matching.length > 0
                ? `${shortlist.length} agronomists cover this enterprise.`
                : "No speciality match in your counties — showing every verified agronomist."
            }
          >
            <SelectInput
              value={crop}
              onChange={(value) => {
                setCrop(value);
                const next = AGRONOMISTS.find((item) =>
                  item.speciality
                    .toLowerCase()
                    .includes(
                      CROP_KEYWORDS.find((entry) => entry.crop === value)?.keyword ?? "",
                    ),
                );
                if (next) setAgronomistId(next.id);
              }}
              options={CROP_KEYWORDS.map((item) => item.crop)}
            />
          </Field>
          <div className="d-flex flex-column gap-2">
            {shortlist.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`gm-checkcard ${agronomistId === item.id ? "on" : ""}`}
                onClick={() => setAgronomistId(item.id)}
              >
                <input type="radio" checked={agronomistId === item.id} readOnly tabIndex={-1} />
                <span>
                  <strong>
                    {item.name} · ★ {item.rating}
                  </strong>
                  <small>
                    {item.speciality} · {item.counties} · replies {item.responseTime} ·{" "}
                    {item.fee === 0 ? "free" : `KES ${item.fee} per session`}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Describe the issue"
          />
        </div>
      ) : step === 2 ? (
        <div className="gm-cm-stack">
          <Field label="What are you seeing?">
            <textarea
              className="gm-textarea"
              rows={4}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </Field>
          <div>
            <span className="gm-field-label">Attach</span>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`gm-filter-chip ${photo ? "is-active" : ""}`}
                onClick={() => setPhoto(!photo)}
              >
                Plot photo
              </button>
              <span className="gm-chip gm-chip-ghost">Plot 1 · 0.5 acre</span>
              <span className="gm-chip gm-chip-ghost">Last spray: SR-004</span>
            </div>
          </div>
          <div className="gm-form-grid">
            <Field label="Urgency">
              <SelectInput
                value={urgency}
                onChange={setUrgency}
                options={["Within 24 hours", "Within 3 days", "This week", "No rush"]}
              />
            </Field>
            <Field label="Preferred date">
              <TextInput value={date} type="date" onChange={setDate} />
            </Field>
          </div>
          <Callout
            icon={ShieldCheck}
            title="Free allowance check"
            body={`${COMMUNITY_CONTEXT.expertCredits} free chat sessions and ${COMMUNITY_CONTEXT.photoCredits} free photo diagnosis left this month.`}
          />
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextLabel="Confirm the request"
            nextDisabled={details.trim().length < 12}
          />
        </div>
      ) : (
        <div className="gm-cm-stack">
          <div className="gm-cm-review">
            <ReviewRow label="Service" value={service.label} />
            <ReviewRow label="Agronomist" value={`${agronomist.name} (★ ${agronomist.rating})`} />
            <ReviewRow label="Crop" value={crop} />
            <ReviewRow label="Urgency" value={urgency} />
            <ReviewRow label="Preferred date" value={date} />
            <ReviewRow label="Photo" value={photo ? "attached" : "none"} />
            <ReviewRow label="Amount due" value={payable === 0 ? "Free (monthly allowance)" : kes(payable)} />
          </div>
          {service.id === "svc-1" || service.id === "svc-2" ? (
            <Toggle
              checked={useFree}
              onChange={setUseFree}
              label="Use my free monthly allowance"
              desc="Chat and photo diagnosis are covered by the free allowance until it runs out."
            />
          ) : null}
          {payable > 0 ? (
            <PayPanel
              amount={payable}
              purpose={`${service.label} with ${agronomist.name}`}
              payee="GrowMO agronomist desk"
              onPaid={(receipt) => {
                onBooked({
                  agronomist: agronomist.name,
                  service: service.label,
                  channel: service.days,
                  cost: payable,
                  receipt,
                  date,
                });
                onClose();
              }}
            />
          ) : (
            <div className="d-flex justify-content-between gap-2">
              <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  onBooked({
                    agronomist: agronomist.name,
                    service: service.label,
                    channel: service.days,
                    cost: 0,
                    receipt: "FREE-ALLOWANCE",
                    date,
                  });
                  onClose();
                }}
              >
                <Send /> Send request
              </button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

export function AgronomistProfileDialog({
  open,
  agronomist,
  onClose,
  onRequest,
  onChat,
}: {
  open: boolean;
  agronomist: Agronomist | null;
  onClose: () => void;
  onRequest: (agronomist: Agronomist) => void;
  onChat: (agronomist: Agronomist) => void;
}) {
  if (!agronomist) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${agronomist.name} · ${agronomist.title}`}
      desc={`${agronomist.counties} · ${agronomist.years} years of practice`}
    >
      <div className="gm-cm-stack">
        <div className="d-flex flex-wrap gap-2">
          {agronomist.verified ? <StatusChip label="Verified agronomist" tone="low" /> : null}
          <StatusChip label={`★ ${agronomist.rating}`} tone="medium" />
          <StatusChip label={`${agronomist.sessions} sessions`} tone="neutral" />
          <StatusChip label={`Replies ${agronomist.responseTime}`} tone="neutral" />
        </div>
        <p className="mb-0" style={{ fontSize: "0.9rem" }}>
          {agronomist.bio}
        </p>
        <div className="gm-cm-review">
          <ReviewRow label="Speciality" value={agronomist.speciality} />
          <ReviewRow label="Languages" value={agronomist.languages} />
          <ReviewRow label="Counties covered" value={agronomist.counties} />
          <ReviewRow
            label="Session fee"
            value={agronomist.fee === 0 ? "Free (county officer)" : kes(agronomist.fee)}
          />
          <ReviewRow label="Contact" value={agronomist.phone} />
        </div>
        <Callout
          icon={BadgeCheck}
          title="How verification works"
          body="GrowMO checked the practising certificate, employer or registration before the green badge was added."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => onChat(agronomist)}>
            <MessageCircle /> Open chat
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onRequest(agronomist)}>
            <Send /> Request a session
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function SessionDetailDialog({
  open,
  session,
  onClose,
  onRate,
  onRepeat,
}: {
  open: boolean;
  session: AgroSession | null;
  onClose: () => void;
  onRate: (session: AgroSession) => void;
  onRepeat: (session: AgroSession) => void;
}) {
  if (!session) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Session with ${session.agronomist}`}
      desc={`${session.date} · ${session.channel} · ${session.duration}`}
    >
      <div className="gm-cm-stack">
        <div className="gm-cm-review">
          <ReviewRow label="Topic" value={session.topic} />
          <ReviewRow label="Outcome" value={session.outcome} />
          <ReviewRow
            label="Cost"
            value={session.cost === 0 ? "Free (monthly allowance)" : kes(session.cost)}
          />
          <ReviewRow label="Reference" value={session.receipt} />
          <ReviewRow label="Your rating" value={session.rating ? `${session.rating} / 5` : "Not rated"} />
        </div>
        <Callout
          icon={ClipboardCheck}
          title="This advice is linked to your records"
          body="Spray records, diary entries and certifications mention this session, so the audit trail stays joined up."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => onRate(session)}>
            Rate this session
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onRepeat(session)}>
            <Send /> Book a follow-up
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function RateSessionDialog({
  open,
  session,
  onClose,
  onRated,
}: {
  open: boolean;
  session: AgroSession | null;
  onClose: () => void;
  onRated: (session: AgroSession, stars: number, comment: string) => void;
}) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) return;
    setStars(5);
    setComment("");
  }, [open]);

  if (!session) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Rate this session" desc={session.topic}>
      <div className="gm-cm-stack">
        <div>
          <span className="gm-field-label">How useful was the advice?</span>
          <div className="gm-rate" role="group" aria-label="Session rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                className={value <= stars ? "on" : ""}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                onClick={() => setStars(value)}
              >
                <span>★</span>
              </button>
            ))}
          </div>
        </div>
        <Field label="Comment for other farmers">
          <textarea
            className="gm-textarea"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="e.g. Alinielekeza vizuri kuhusu PHI na harvest ikawa salama."
          />
        </Field>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onRated(session, stars, comment);
              onClose();
            }}
          >
            <ThumbsUp /> Submit rating
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function AskExpertDialog({
  open,
  onClose,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  onSent: (question: string) => void;
}) {
  const [question, setQuestion] = useState("");
  const [expertId, setExpertId] = useState(AGRONOMISTS[0].id);
  const [publicPost, setPublicPost] = useState(true);
  const expert = AGRONOMISTS.find((item) => item.id === expertId) ?? AGRONOMISTS[0];

  useEffect(() => {
    if (!open) return;
    setQuestion("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Ask a verified agronomist"
      desc="Answers within two hours, and the reply stays in the forum for others."
    >
      <div className="gm-cm-stack">
        <Field label="Agronomist">
          <SelectInput
            value={expertId}
            onChange={setExpertId}
            options={AGRONOMISTS.map((item) => item.id)}
          />
        </Field>
        <div className="gm-cm-review">
          <ReviewRow label="Speciality" value={expert.speciality} />
          <ReviewRow label="Counties" value={expert.counties} />
          <ReviewRow label="Typical reply" value={expert.responseTime} />
          <ReviewRow
            label="Fee"
            value={expert.fee === 0 ? "Free (county officer)" : `${kes(expert.fee)} after free sessions`}
          />
        </div>
        <Field label="Your question">
          <textarea
            className="gm-textarea"
            rows={4}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. Nitumie dawa gani kwa aphids kwenye sukuma wiki ninapovuna kila wiki?"
          />
        </Field>
        <Toggle
          checked={publicPost}
          onChange={setPublicPost}
          label="Post the answer publicly in the forum"
          desc="Helps other farmers — your phone number is never shown."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={question.trim().length < 12}
            onClick={() => {
              onSent(question);
              onClose();
            }}
          >
            <Send /> Send question
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* =========================== 4. FARMER GROUPS =========================== */

export function JoinGroupWizard({
  open,
  group,
  onClose,
  onJoined,
}: {
  open: boolean;
  group: FarmerGroup | null;
  onClose: () => void;
  onJoined: (group: FarmerGroup, receipt: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("Full member");
  const [interests, setInterests] = useState<string[]>(["Group buying"]);
  const [phone, setPhone] = useState(COMMUNITY_CONTEXT.phone);
  const [shareBenchmark, setShareBenchmark] = useState(true);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setRole("Full member");
    setInterests(["Group buying"]);
    setShareBenchmark(true);
  }, [open]);

  if (!group) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Join ${group.name}`}
      desc={`${group.county} · ${group.focus} · ${group.members.toLocaleString("en-KE")} members`}
    >
      <Stepper steps={["Your details", "What you want", "Fee & confirm"]} current={step} />
      {step === 0 ? (
        <div className="gm-cm-stack">
          <div className="gm-form-grid">
            <Field label="Member name">
              <StaticField value={COMMUNITY_CONTEXT.farmer} />
            </Field>
            <Field label="M-Pesa phone">
              <TextInput value={phone} onChange={setPhone} />
            </Field>
            <Field label="Role">
              <SelectInput
                value={role}
                onChange={setRole}
                options={[
                  "Full member",
                  "Mentor",
                  "Committee volunteer",
                  "Youth chapter",
                  "Associate member",
                ]}
              />
            </Field>
            <Field label="Meetings">
              <StaticField value={group.meeting} />
            </Field>
          </div>
          <Callout
            icon={Handshake}
            title="What the group sees"
            body="Your display name, county and benchmark numbers. Never your phone number or full farm records."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Choose activities"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-cm-stack">
          <div>
            <span className="gm-field-label">Which activities interest you?</span>
            <div className="d-flex flex-wrap gap-2">
              {[
                "Group buying",
                "Collective marketing",
                "Training",
                "Warehouse receipt",
                "Transport sharing",
                "Group loans",
                "Mentorship",
              ].map((item) => {
                const active = interests.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    className={`gm-filter-chip ${active ? "is-active" : ""}`}
                    onClick={() =>
                      setInterests((current) =>
                        active ? current.filter((value) => value !== item) : [...current, item],
                      )
                    }
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
          <Toggle
            checked={shareBenchmark}
            onChange={setShareBenchmark}
            label="Share my benchmarks with the group"
            desc="Needed for group-level comparison charts and the collective marketing scorecard."
          />
          <div className="gm-cm-review">
            <ReviewRow label="Group" value={group.name} />
            <ReviewRow label="Current benefit" value={group.savings} />
            <ReviewRow label="Fee" value={group.fee === 0 ? "Free to join" : `${kes(group.fee)} ${group.feeUnit}`} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Fee & confirm"
            nextDisabled={interests.length === 0}
          />
        </div>
      ) : group.fee > 0 ? (
        <PayPanel
          amount={group.fee}
          purpose={`${group.name} membership (${group.feeUnit})`}
          payee={group.name}
          onPaid={(receipt) => {
            onJoined(group, receipt);
            onClose();
          }}
        />
      ) : (
        <SuccessState
          title="Membership started"
          body={`You have joined ${group.name}. The next ${group.meeting} is on the group calendar and in your reminders.`}
          actionLabel="Open the group workspace"
          onDone={() => {
            onJoined(group, "FREE");
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}

export function LeaveGroupDialog({
  open,
  group,
  onClose,
  onLeft,
}: {
  open: boolean;
  group: FarmerGroup | null;
  onClose: () => void;
  onLeft: (group: FarmerGroup) => void;
}) {
  if (!group) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Leave ${group.name}?`}
      desc="You can rejoin later, but group buying benefits stop immediately."
    >
      <div className="gm-cm-stack">
        <Callout
          icon={AlertTriangle}
          title="What you will lose"
          body={`${group.savings}. Your benchmark sharing with ${group.members.toLocaleString("en-KE")} members also stops.`}
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Stay in the group
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => {
              onLeft(group);
              onClose();
            }}
          >
            Leave group
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function GroupBuyingWizard({
  open,
  initialItem,
  onClose,
  onOrdered,
}: {
  open: boolean;
  initialItem?: GroupOrderItem | null;
  onClose: () => void;
  onOrdered: (summary: {
    item: string;
    quantity: number;
    total: number;
    receipt: string;
    delivery: string;
  }) => void;
}) {
  const [step, setStep] = useState(0);
  const [itemId, setItemId] = useState(initialItem?.id ?? GROUP_ORDER_ITEMS[0].id);
  const [quantity, setQuantity] = useState("4");
  const [delivery, setDelivery] = useState("Githunguri co-op store");
  const [split, setSplit] = useState("Pay my share now");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [otp, setOtp] = useState("");
  const steps = ["Item", "Quantity & delivery", "Pay my share"];

  const item = GROUP_ORDER_ITEMS.find((entry) => entry.id === itemId) ?? GROUP_ORDER_ITEMS[0];
  const units = Math.max(1, Number(quantity) || 1);
  const total = item.groupPrice * units;

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setReceipt("");
    setOtp("");
    setBusy(false);
    if (initialItem) setItemId(initialItem.id);
  }, [open, initialItem]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Group buying order"
      desc="Bulk input orders at group prices, delivered to a shared collection point."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-cm-stack">
          <div className="d-flex flex-column gap-2">
            {GROUP_ORDER_ITEMS.slice(0, 6).map((entry) => (
              <button
                type="button"
                key={entry.id}
                className={`gm-checkcard ${itemId === entry.id ? "on" : ""}`}
                onClick={() => setItemId(entry.id)}
              >
                <input type="radio" checked={itemId === entry.id} readOnly tabIndex={-1} />
                <span>
                  <strong>
                    {entry.item} · {kes(entry.groupPrice)} {entry.unit}
                  </strong>
                  <small>
                    Retail {kes(entry.retailPrice)} — save{" "}
                    {kes(entry.retailPrice - entry.groupPrice)} per {entry.unit} · minimum{" "}
                    {entry.minimum} · closes {entry.closes} · {entry.supplier}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Quantity & delivery"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-cm-stack">
          <div className="gm-form-grid">
            <Field label={`Quantity (${item.unit}s)`} hint={`Group minimum: ${item.minimum}`}>
              <TextInput value={quantity} type="number" onChange={setQuantity} />
            </Field>
            <Field label="Collection point">
              <SelectInput
                value={delivery}
                onChange={setDelivery}
                options={[
                  "Githunguri co-op store",
                  "Githunguri social hall",
                  "Kenya Seed Depot, Thika",
                  "Machakos Wote depot",
                  "Group lorry to the farm",
                ]}
              />
            </Field>
            <Field label="Payment split">
              <SelectInput
                value={split}
                onChange={setSplit}
                options={[
                  "Pay my share now",
                  "Pay on delivery",
                  "Group loan (repay after harvest)",
                ]}
              />
            </Field>
          </div>
          <div className="gm-cm-review">
            <ReviewRow label="Item" value={item.item} />
            <ReviewRow label="Quantity" value={`${units} ${item.unit}s`} />
            <ReviewRow label="Group price" value={`${kes(item.groupPrice)} per ${item.unit}`} />
            <ReviewRow label="Retail would be" value={kes(item.retailPrice * units)} />
            <ReviewRow label="Your saving" value={kes((item.retailPrice - item.groupPrice) * units)} />
            <ReviewRow label="Total" value={kes(total)} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Pay my share"
          />
        </div>
      ) : receipt ? (
        <SuccessState
          title="Order placed with the group"
          body={`${units} ${item.unit}(s) of ${item.item} reserved. Collection at ${delivery} once the order closes.`}
          receipt={receipt}
          actionLabel="Add to my input records"
          onDone={() => {
            onOrdered({ item: item.item, quantity: units, total, receipt, delivery });
            onClose();
          }}
        />
      ) : split === "Group loan (repay after harvest)" ? (
        <div className="gm-cm-stack">
          <Callout
            icon={Handshake}
            title="Group input loan"
            body={`The group fund pays ${kes(total)} now and you repay after harvest. The kit list is added to your existing loan ledger.`}
          />
          <div className="gm-cm-review">
            <ReviewRow label="Repay by" value="30 Nov 2026" />
            <ReviewRow label="Group loan rate" value="5% flat per season" />
            <ReviewRow label="Monthly repayment" value={kes(Math.round((total * 1.05) / 3))} />
          </div>
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onOrdered({
                  item: item.item,
                  quantity: units,
                  total,
                  receipt: `QKLOAN${units}`,
                  delivery,
                });
                onClose();
              }}
            >
              <ClipboardCheck /> Accept the group loan
            </button>
          </div>
        </div>
      ) : split === "Pay on delivery" ? (
        <div className="gm-cm-stack">
          <Callout
            icon={Truck}
            title="Pay on delivery"
            body={`${kes(total)} due at ${delivery}. The group will send an M-Pesa request on the collection day.`}
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onOrdered({
                  item: item.item,
                  quantity: units,
                  total,
                  receipt: `QKCOD${units}PL`,
                  delivery,
                });
                onClose();
              }}
            >
              <CheckCircle2 /> Reserve & pay later
            </button>
          </div>
        </div>
      ) : (
        <div className="gm-cm-stack">
          <div className="gm-cm-pay">
            <Smartphone />
            <span>
              <strong>
                {kes(total)} to {item.supplier}
              </strong>
              <small>
                {units} {item.unit}(s) of {item.item} · group order via {delivery}
              </small>
            </span>
          </div>
          {busy ? (
            <div className="gm-cm-processing">
              <LoaderCircle />
              <strong>Confirming M-Pesa payment…</strong>
              <small>Paying to the group buying account.</small>
            </div>
          ) : (
            <>
              <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP (demo: 123456)" />
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => setOtp("123456")}
              >
                Use demo OTP
              </button>
            </>
          )}
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={otp.length !== 6 || busy}
              onClick={() => {
                setBusy(true);
                window.setTimeout(() => {
                  setBusy(false);
                  setReceipt(`QKGB${units * 37}PL`);
                }, 1200);
              }}
            >
              <LockKeyhole /> Pay {kes(total)}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function ContributionDialog({
  open,
  contribution,
  onClose,
  onPaid,
}: {
  open: boolean;
  contribution: GroupContribution | null;
  onClose: () => void;
  onPaid: (id: string, receipt: string) => void;
}) {
  if (!contribution) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Contribution · ${contribution.purpose}`}
      desc={`${contribution.group} · due ${contribution.date}`}
    >
      <div className="gm-cm-stack">
        <div className="gm-cm-review">
          <ReviewRow label="Member" value={contribution.member} />
          <ReviewRow label="Group" value={contribution.group} />
          <ReviewRow label="Purpose" value={contribution.purpose} />
          <ReviewRow label="Amount" value={kes(contribution.amount)} />
          <ReviewRow label="Due date" value={contribution.date} />
          <ReviewRow label="Status" value={contribution.status} />
        </div>
        {contribution.amount === 0 || contribution.status === "Paid" ? (
          <SuccessState
            title={contribution.amount === 0 ? "Nothing to pay" : "Already settled"}
            body={
              contribution.amount === 0
                ? "This contribution is covered by the group fund or waived for members."
                : `${kes(contribution.amount)} was settled on ${contribution.date}. Receipt ${contribution.receipt} is in the group ledger.`
            }
            actionLabel="Close"
            onDone={onClose}
          />
        ) : (
          <PayPanel
            amount={contribution.amount}
            purpose={`${contribution.purpose} · ${contribution.group}`}
            payee={`${contribution.group} group account`}
            onPaid={(receipt) => {
              onPaid(contribution.id, receipt);
              onClose();
            }}
          />
        )}
      </div>
    </Dialog>
  );
}

export function EventRegisterDialog({
  open,
  event,
  onClose,
  onRegistered,
}: {
  open: boolean;
  event: GroupEvent | null;
  onClose: () => void;
  onRegistered: (event: GroupEvent, attendees: number, receipt: string) => void;
}) {
  const [attendees, setAttendees] = useState("1");
  const [reminder, setReminder] = useState(true);
  const [transport, setTransport] = useState(false);
  const [cancel, setCancel] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAttendees("1");
    setReminder(true);
    setTransport(false);
    setCancel(false);
  }, [open]);

  if (!event) return null;

  const total = event.fee * Math.max(1, Number(attendees) || 1) + (transport ? 300 : 0);

  if (cancel) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={`Cancel registration · ${event.title}`}
        desc={`${event.date} · ${event.county}`}
      >
        <div className="gm-cm-stack">
          <Callout
            icon={AlertTriangle}
            title="Seats are limited"
            body={`${event.seats - event.taken} of ${event.seats} seats are still open and the waiting list is active. Cancelling releases your place.`}
          />
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setCancel(false)}>
              Keep my seat
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-danger-soft"
              onClick={() => {
                onRegistered(event, 0, "CANCELLED");
                onClose();
              }}
            >
              Cancel registration
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={event.registered ? `Manage · ${event.title}` : `Register · ${event.title}`}
      desc={`${event.group} · ${event.mode} · ${event.date} · ${event.county}`}
    >
      <div className="gm-cm-stack">
        {event.registered ? (
          <div className="gm-cm-review">
            <ReviewRow label="Status" value="Registered" />
            <ReviewRow label="Topic" value={event.topic} />
            <ReviewRow label="Seats taken" value={`${event.taken} of ${event.seats}`} />
            <ReviewRow label="Fee paid" value={event.fee === 0 ? "Free event" : kes(event.fee)} />
          </div>
        ) : (
          <>
            <div className="gm-form-grid">
              <Field label="Attendees">
                <TextInput value={attendees} type="number" onChange={setAttendees} />
              </Field>
              <Field label="Fee per attendee">
                <StaticField value={event.fee === 0 ? "Free" : kes(event.fee)} />
              </Field>
            </div>
            <Toggle
              checked={transport}
              onChange={setTransport}
              label="Add shared transport (KES 300)"
              desc="Group pickups leave from the usual collection point two hours before the event."
            />
            <Toggle
              checked={reminder}
              onChange={setReminder}
              label="Send me an SMS reminder the day before"
              desc={event.registered ? "Reminder already set." : "Includes the venue pin and what to carry."}
            />
            <div className="gm-cm-review">
              <ReviewRow label="Event" value={`${event.title} (${event.mode})`} />
              <ReviewRow label="Topic" value={event.topic} />
              <ReviewRow label="Total due" value={total === 0 ? "Free" : kes(total)} />
            </div>
          </>
        )}
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          {event.registered ? (
            <>
              <button
                type="button"
                className="gm-btn gm-btn-soft"
                onClick={() => setReminder(!reminder)}
              >
                {reminder ? "Reminder on" : "Reminder off"}
              </button>
              <button type="button" className="gm-btn gm-btn-danger-soft" onClick={() => setCancel(true)}>
                Cancel registration
              </button>
            </>
          ) : total === 0 ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onRegistered(event, Number(attendees) || 1, "FREE");
                onClose();
              }}
            >
              <CheckCircle2 /> Reserve my seat
            </button>
          ) : null}
        </div>
        {!event.registered && total > 0 ? (
          <PayPanel
            amount={total}
            purpose={`${event.title} (${attendees} attendee${Number(attendees) === 1 ? "" : "s"})`}
            payee={event.group}
            onPaid={(receipt) => {
              onRegistered(event, Number(attendees) || 1, receipt);
              onClose();
            }}
          />
        ) : null}
      </div>
    </Dialog>
  );
}

/* ======================= 5. STORIES + BENCHMARKS ======================== */

export function StoryDetailDialog({
  open,
  story,
  onClose,
  onFollow,
  onShare,
}: {
  open: boolean;
  story: SuccessStory | null;
  onClose: () => void;
  onFollow: (story: SuccessStory) => void;
  onShare: (story: SuccessStory) => void;
}) {
  if (!story) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${story.farmer} · ${story.county}`}
      desc={`${story.crop} · ${story.acres} · farming with GrowMO since ${story.since}`}
    >
      <div className="gm-cm-stack">
        <div className="gm-cm-story-compare">
          <div className="gm-cm-review" style={{ display: "block" }}>
            <ReviewRow label="Before" value={story.before} />
          </div>
          <div className="gm-cm-review" style={{ display: "block" }}>
            <ReviewRow label="After" value={story.after} />
          </div>
        </div>
        <div className="gm-cm-review">
          <ReviewRow label="Achievement" value={story.achievement} />
          <ReviewRow label="Income" value={story.income} />
          <ReviewRow label="Verified" value={story.verified ? "Records checked by GrowMO" : "Self-reported"} />
        </div>
        <p style={{ fontSize: "0.9rem" }}>{story.story}</p>
        <blockquote className="gm-cm-quote">“{story.quote}”</blockquote>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => onShare(story)}>
            <Share2 /> Share the story
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onFollow(story)}>
            <Users /> Follow this farmer
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function BenchmarkCompareDialog({
  open,
  metric,
  onClose,
  onApply,
}: {
  open: boolean;
  metric: BenchmarkMetric | null;
  onClose: () => void;
  onApply: (metric: BenchmarkMetric, plan: string) => void;
}) {
  const [group, setGroup] = useState(PEER_GROUPS[0].name);
  const [plan, setPlan] = useState(
    "Reduce spray cost by switching two applications to bio-pesticides",
  );

  useEffect(() => {
    if (!open) return;
    setGroup(PEER_GROUPS[0].name);
  }, [open]);

  if (!metric) return null;

  const gap = metric.higherIsBetter
    ? metric.top25 - metric.mine
    : metric.mine - metric.top25;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Compare · ${metric.metric}`}
      desc={`${metric.unit} · ${metric.note}`}
    >
      <div className="gm-cm-stack">
        <Field label="Peer group">
          <SelectInput
            value={group}
            onChange={setGroup}
            options={PEER_GROUPS.map((item) => item.name)}
          />
        </Field>
        <div className="gm-cm-review">
          <ReviewRow label="Your farm" value={metric.mine.toLocaleString("en-KE")} />
          <ReviewRow label="County average" value={metric.countyAvg.toLocaleString("en-KE")} />
          <ReviewRow label="Top 25% in Kiambu" value={metric.top25.toLocaleString("en-KE")} />
          <ReviewRow label="Best peer farm" value={metric.peerTop.toLocaleString("en-KE")} />
          <ReviewRow
            label={gap > 0 ? "Gap to top 25%" : "You are already ahead"}
            value={gap > 0 ? `${Math.abs(gap).toLocaleString("en-KE")} ${metric.unit}` : "—"}
          />
        </div>
        <Field label="Action to close the gap">
          <textarea
            className="gm-textarea"
            rows={3}
            value={plan}
            onChange={(event) => setPlan(event.target.value)}
          />
        </Field>
        <Callout
          icon={BadgeCheck}
          title="How this benchmark is built"
          body={`${PEER_GROUPS.find((item) => item.name === group)?.matches ?? 4} comparable farms, same crop and acreage bracket, complete records only.`}
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={plan.trim().length < 8}
            onClick={() => {
              onApply(metric, plan);
              onClose();
            }}
          >
            <ClipboardCheck /> Add action to my season plan
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function InviteFarmerDialog({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: (phone: string, group: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState(FARMER_GROUPS[0].name);
  const [message, setMessage] = useState(
    "Karibu GrowMO — tunaweza kuona bei za soko, kujifunza na kupima mavuno pamoja. Jiunge nami kwenye kikundi.",
  );

  useEffect(() => {
    if (!open) return;
    setPhone("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite a farmer"
      desc="They receive an SMS with your name and the group link."
    >
      <div className="gm-cm-stack">
        <Field label="Farmer phone number" hint="Use the 07XX format.">
          <TextInput value={phone} onChange={setPhone} placeholder="0722 000 000" />
        </Field>
        <Field label="Suggested group">
          <SelectInput
            value={group}
            onChange={setGroup}
            options={FARMER_GROUPS.map((item) => item.name)}
          />
        </Field>
        <Field label="Message">
          <textarea
            className="gm-textarea"
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
        <Callout
          icon={Send}
          title="You earn 50 points per farmer who joins"
          body="Points unlock badges and free paid sessions with verified agronomists."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={phone.trim().length < 9}
            onClick={() => {
              onInvited(phone, group);
              onClose();
            }}
          >
            <Send /> Send invitation
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function CommunitySettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: typeof COMMUNITY_SETTINGS;
  onClose: () => void;
  onSave: (next: typeof COMMUNITY_SETTINGS) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
  }, [open, settings]);

  const set = <K extends keyof typeof COMMUNITY_SETTINGS>(
    key: K,
    value: (typeof COMMUNITY_SETTINGS)[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Community & learning settings"
      desc="Control what reaches you and what other farmers can see."
    >
      <div className="gm-cm-stack">
        <Toggle
          checked={draft.threadReplies}
          onChange={(value) => set("threadReplies", value)}
          label="Alert me when someone replies to my thread"
          desc={`You have ${COMMUNITY_CONTEXT.answersGiven} answers and ${COMMUNITY_CONTEXT.questionsAsked} questions on record.`}
        />
        <Toggle
          checked={draft.mentionAlerts}
          onChange={(value) => set("mentionAlerts", value)}
          label="Alert me when I am mentioned"
          desc="Mentions in county and group threads."
        />
        <Toggle
          checked={draft.groupChat}
          onChange={(value) => set("groupChat", value)}
          label="Group chat notifications"
          desc="Messages from the three groups you belong to."
        />
        <Toggle
          checked={draft.expertPromos}
          onChange={(value) => set("expertPromos", value)}
          label="Agronomist promotions and offers"
          desc="Occasional paid-service offers from verified agronomists."
        />
        <Toggle
          checked={draft.weeklyDigest}
          onChange={(value) => set("weeklyDigest", value)}
          label="Weekly learning digest"
          desc="Five resources and the top three threads in your county."
        />
        <Toggle
          checked={draft.showCounty}
          onChange={(value) => set("showCounty", value)}
          label="Show my county on posts"
          desc="Helps neighbours answer rainfall and market questions."
        />
        <Toggle
          checked={draft.showPhone}
          onChange={(value) => set("showPhone", value)}
          label="Show my phone number to group members"
          desc="Off by default. Buyers see only the batch passport contact."
        />
        <div className="gm-form-grid">
          <Field label="Digest day">
            <SelectInput
              value={draft.digestDay}
              onChange={(value) => set("digestDay", value)}
              options={["Sunday", "Monday", "Friday", "Saturday"]}
            />
          </Field>
          <Field label="Language preference">
            <SelectInput
              value={draft.language}
              onChange={(value) => set("language", value)}
              options={[
                "English (Kiswahili threads shown too)",
                "Kiswahili",
                "English only",
              ]}
            />
          </Field>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            <CheckCircle2 /> Save settings
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ShareStoryDialog({
  open,
  story,
  onClose,
  onShared,
}: {
  open: boolean;
  story: SuccessStory | null;
  onClose: () => void;
  onShared: (story: SuccessStory, channel: string) => void;
}) {
  const [channel, setChannel] = useState("WhatsApp");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setDone(false);
  }, [open]);

  const link = useMemo(
    () =>
      `growmo.ke/stories/${(story?.farmer ?? "farmer")
        .toLowerCase()
        .replace(/[^a-z]+/g, "-")}-${story?.county.toLowerCase() ?? "ke"}`,
    [story],
  );

  if (!story) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Share this success story"
      desc={`${story.farmer} · ${story.county} · ${story.crop}`}
    >
      {done ? (
        <SuccessState
          title="Story shared"
          body={`${story.farmer}'s story was shared via ${channel}. Anyone opening the link sees the before-and-after numbers.`}
          actionLabel="Done"
          onDone={onClose}
        />
      ) : (
        <div className="gm-cm-stack">
          <div>
            <span className="gm-field-label">Channel</span>
            <div className="d-flex flex-wrap gap-2">
              {["WhatsApp", "SMS", "Group thread", "Copy link"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`gm-filter-chip ${channel === item ? "is-active" : ""}`}
                  onClick={() => setChannel(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="gm-cm-review">
            <ReviewRow label="Achievement" value={story.achievement} />
            <ReviewRow label="Income" value={story.income} />
            <ReviewRow label="Link" value={<span className="gm-code-chip">{link}</span>} />
          </div>
          {busy ? (
            <div className="gm-cm-processing">
              <LoaderCircle />
              <strong>Sharing…</strong>
              <small>Retrying automatically if the network drops.</small>
            </div>
          ) : null}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                window.setTimeout(() => {
                  setBusy(false);
                  setDone(true);
                  onShared(story, channel);
                }, 800);
              }}
            >
              <Share2 /> Share via {channel}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function CategoryThreadsDialog({
  open,
  category,
  threads,
  onClose,
  onOpenThread,
  onNewThread,
}: {
  open: boolean;
  category: ForumCategory | null;
  threads: ForumThread[];
  onClose: () => void;
  onOpenThread: (thread: ForumThread) => void;
  onNewThread: (category: ForumCategory) => void;
}) {
  const [subForum, setSubForum] = useState("all");

  useEffect(() => {
    setSubForum("all");
  }, [category?.id]);

  if (!category) return null;

  const shown = threads.filter(
    (thread) =>
      thread.category === category.name &&
      (subForum === "all" || thread.subForum === subForum),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${category.name} forum`}
      desc={`${category.members.toLocaleString("en-KE")} members · ${category.threads} threads · ${category.subForums.length} sub-forums`}
    >
      <div className="gm-cm-stack">
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`gm-filter-chip ${subForum === "all" ? "is-active" : ""}`}
            onClick={() => setSubForum("all")}
          >
            All sub-forums
          </button>
          {category.subForums.map((item) => (
            <button
              type="button"
              key={item}
              className={`gm-filter-chip ${subForum === item ? "is-active" : ""}`}
              onClick={() => setSubForum(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <div className="gm-empty">
            <span className="gm-service-icon">
              <MessageCircle />
            </span>
            <h3 className="font-display">No thread in this sub-forum yet</h3>
            <p className="text-muted">
              Be the first to ask — questions in a new sub-forum get answered fast
              because they are not buried.
            </p>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onClose();
                onNewThread(category);
              }}
            >
              <MessageCircle /> Start the first thread
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column">
            {shown.map((thread) => (
              <div className="gm-cm-thread" key={thread.id}>
                <div className="gm-cm-thread-main">
                  <div className="gm-cm-thread-head">
                    {thread.solved ? <StatusChip label="Solved" tone="low" /> : null}
                    <StatusChip label={thread.subForum} tone="neutral" />
                  </div>
                  <button
                    type="button"
                    className="gm-cm-thread-title"
                    onClick={() => {
                      onClose();
                      onOpenThread(thread);
                    }}
                  >
                    {thread.title}
                  </button>
                  <div className="gm-cm-thread-meta">
                    <span>
                      <strong>{thread.author}</strong> · {thread.posted}
                    </span>
                    <span>{thread.replies.length} replies</span>
                  </div>
                </div>
                <div className="gm-cm-thread-side">
                  <span className="font-display">{thread.likes}</span>
                  <small>likes</small>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <span className="gm-chip gm-chip-ghost">
            {LIBRARY_CATEGORIES.length} library categories linked to this forum
          </span>
          <div className="d-flex gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onClose();
                onNewThread(category);
              }}
            >
              <MessageCircle /> New thread
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export function ExpertContactDialog({
  open,
  agronomist,
  onClose,
  onCall,
  onSms,
  onEmail,
}: {
  open: boolean;
  agronomist: Agronomist | null;
  onClose: () => void;
  onCall: (agronomist: Agronomist) => void;
  onSms: (agronomist: Agronomist) => void;
  onEmail: (agronomist: Agronomist) => void;
}) {
  if (!agronomist) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Contact ${agronomist.name}`}
      desc={`${agronomist.phone} · replies ${agronomist.responseTime}`}
    >
      <div className="gm-cm-stack">
        <div className="gm-cm-review">
          <ReviewRow label="Speciality" value={agronomist.speciality} />
          <ReviewRow label="Counties" value={agronomist.counties} />
          <ReviewRow label="Languages" value={agronomist.languages} />
          <ReviewRow label="Session fee" value={agronomist.fee === 0 ? "Free" : kes(agronomist.fee)} />
        </div>
        <Callout
          icon={Phone}
          title="Call charges"
          body="A voice consultation is billed at KES 100 per 15 minutes and the agronomist calls you back."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => onSms(agronomist)}>
            <MessageCircle /> Send SMS
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => onEmail(agronomist)}>
            <Mail /> Email request
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onCall(agronomist)}>
            <Phone /> Request a call
          </button>
        </div>
      </div>
    </Dialog>
  );
}
