/* ============================================================================
   PAGE 6 WORKFLOWS — worker, task, attendance, payroll and settings dialogs
   ========================================================================== */
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  ImagePlus,
  Info,
  LoaderCircle,
  MessageSquare,
  Smartphone,
  Sparkles,
  WalletCards,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type {
  AttendanceRecord,
  AttendanceStatus,
  LabourSettings,
  LabourTask,
  PaymentStatus,
  PayrollPayment,
  RateType,
  TaskTemplate,
  TaskType,
  Worker,
  WorkerStatus,
} from "../../data/app/labour";
import {
  PAYMENT_FREQUENCIES,
  REQUIRED_TOOLS,
  TASK_TEMPLATES,
  TASK_TYPES,
  WORKER_SKILLS,
} from "../../data/app/labour";
import { kes } from "../../data/site";
import { Dialog, OtpInput, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";
import { LabourInsight } from "./LabourWidgets";

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

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      className="gm-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function CheckOption({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <label
      className={`gm-check-row ${checked ? "is-checked" : ""}`}
      style={{ cursor: "pointer" }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span style={{ flex: 1 }}>
        <strong>{label}</strong>
        {sub ? <small>{sub}</small> : null}
      </span>
    </label>
  );
}

function WorkerAvatar({
  worker,
}: {
  worker: Pick<Worker, "initials" | "name">;
}) {
  return (
    <span className="gm-avatar" title={worker.name}>
      {worker.initials}
    </span>
  );
}

const emptyWorker = (): Worker => ({
  id: "W-011",
  name: "",
  phone: "",
  mpesaName: "",
  nationalId: "",
  village: "Githunguri",
  county: "Kiambu",
  skills: ["Weeding"],
  dailyRate: 500,
  pieceRates: [],
  preferredPayment: "M-Pesa",
  frequency: "Weekly",
  rating: 0,
  tasksCompleted: 0,
  totalEarned: 0,
  status: "active",
  joined: "13 Nov 2026",
  notes: "New worker — add a short reliability note.",
  initials: "NW",
  emergencyContact: "",
});

export function WorkerWizard({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing?: Worker | null;
  onClose: () => void;
  onSave: (worker: Worker) => void;
}) {
  const [step, setStep] = useState(0);
  const [worker, setWorker] = useState<Worker>(emptyWorker);
  const steps = ["Profile", "Skills & rate", "Confirm"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setWorker(
      editing
        ? {
            ...editing,
            skills: [...editing.skills],
            pieceRates: [...editing.pieceRates],
          }
        : emptyWorker(),
    );
  }, [open, editing]);

  const update = <K extends keyof Worker>(key: K, value: Worker[K]) => {
    setWorker((current) => ({ ...current, [key]: value }));
  };
  const toggleSkill = (skill: string) => {
    setWorker((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  };
  const canNext =
    step === 0
      ? Boolean(worker.name && worker.phone && worker.nationalId)
      : step === 1
        ? worker.skills.length > 0
        : true;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        editing
          ? `Edit worker · ${editing.id}`
          : "Add a worker to the directory"
      }
      desc="Keep the phone, M-Pesa name and agreed rate together so every payment is auditable."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <Field label="Full name" className="col-md-7">
            <TextInput
              value={worker.name}
              placeholder="e.g. Beatrice Wanjiru"
              onChange={(value) => update("name", value)}
            />
          </Field>
          <Field
            label="Worker ID"
            className="col-md-5"
            hint="Generated IDs remain stable for payroll history."
          >
            <TextInput
              value={worker.id}
              onChange={(value) => update("id", value.toUpperCase())}
            />
          </Field>
          <Field label="Kenyan phone" className="col-md-6">
            <TextInput
              value={worker.phone}
              placeholder="07XX XXX XXX"
              onChange={(value) => update("phone", value)}
            />
          </Field>
          <Field label="National ID" className="col-md-6">
            <TextInput
              value={worker.nationalId}
              placeholder="8 digit ID number"
              onChange={(value) => update("nationalId", value)}
            />
          </Field>
          <Field
            label="M-Pesa registered name"
            className="col-md-6"
            hint="Must match the Safaricom account name."
          >
            <TextInput
              value={worker.mpesaName}
              placeholder="Name as shown on M-Pesa"
              onChange={(value) => update("mpesaName", value)}
            />
          </Field>
          <Field label="Village / ward" className="col-md-6">
            <TextInput
              value={worker.village}
              onChange={(value) => update("village", value)}
            />
          </Field>
          <Field label="Emergency contact" className="col-md-6">
            <TextInput
              value={worker.emergencyContact}
              placeholder="Name · phone"
              onChange={(value) => update("emergencyContact", value)}
            />
          </Field>
          <Field label="Directory status" className="col-md-6">
            <SelectInput
              value={worker.status}
              onChange={(value) => update("status", value as WorkerStatus)}
              options={["active", "on-leave", "inactive"]}
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-1">
          <div className="row g-3">
            <Field label="Agreed daily rate (KES)" className="col-md-6">
              <TextInput
                type="number"
                value={worker.dailyRate}
                onChange={(value) => update("dailyRate", Number(value))}
              />
            </Field>
            <Field label="Pay preference" className="col-md-6">
              <SelectInput
                value={worker.frequency}
                onChange={(value) =>
                  update("frequency", value as Worker["frequency"])
                }
                options={[...PAYMENT_FREQUENCIES]}
              />
            </Field>
          </div>
          <span className="gm-field-label mt-3 d-block">
            Skills on this farm
          </span>
          <div className="row g-2 mt-1">
            {WORKER_SKILLS.map((skill) => (
              <div className="col-sm-6 col-lg-4" key={skill}>
                <CheckOption
                  checked={worker.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  label={skill}
                />
              </div>
            ))}
          </div>
          <Field label="Notes for Mary" className="mt-3">
            <textarea
              className="gm-input"
              rows={3}
              value={worker.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-1">
          <div className="gm-plan-detail-hero">
            <WorkerAvatar worker={worker} />
            <div style={{ flex: 1 }}>
              <span className="gm-eyebrow">Ready to save</span>
              <h3 className="font-display mb-1">
                {worker.name || "Unnamed worker"}
              </h3>
              <p className="mb-0 text-muted">
                {worker.phone} · {worker.village}, {worker.county}
              </p>
            </div>
            <StatusChip label={`${worker.skills.length} skills`} tone="low" />
          </div>
          <div className="gm-plan-facts mt-3">
            <span>
              <WalletCards />
              <small>Daily rate</small>
              <strong>{kes(worker.dailyRate)}</strong>
            </span>
            <span>
              <Smartphone />
              <small>Payment</small>
              <strong>{worker.frequency} · M-Pesa</strong>
            </span>
            <span>
              <Wrench />
              <small>First skills</small>
              <strong>{worker.skills.slice(0, 2).join(" · ")}</strong>
            </span>
            <span>
              <FileText />
              <small>Record</small>
              <strong>
                {editing ? "Update existing" : "New directory entry"}
              </strong>
            </span>
          </div>
          <div className="gm-check-row mt-3">
            <CheckCircle2 />
            <span>
              <strong>Ready for task assignment</strong>
              <small>
                The worker will appear in the searchable directory and can be
                selected in the scheduler.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={steps.length - 1}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onNext={() => {
          if (step < steps.length - 1) setStep((current) => current + 1);
          else {
            onSave({
              ...worker,
              initials:
                worker.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "NW",
            });
            onClose();
          }
        }}
        nextDisabled={!canNext}
        finishLabel={editing ? "Save worker" : "Add worker"}
      />
    </Dialog>
  );
}

const blankTask = (): LabourTask => ({
  id: `task-${String(Date.now()).slice(-5)}`,
  title: "",
  type: "Weeding",
  crop: "Cabbage Gloria F1",
  plot: "Plot 1 · Shamba ya nyumba",
  date: "18 Nov 2026",
  startTime: "08:00",
  duration: "Full day",
  workerIds: [],
  rateType: "Daily rate",
  rateAmount: 500,
  estimatedTotal: 0,
  budgetCategory: "Cabbage labour",
  paymentMethod: "GrowMO wallet · M-Pesa",
  paymentTiming: "On completion",
  instructions: "",
  tools: ["Jembe"],
  status: "Upcoming",
  attendance: [],
  actualHours: 0,
  quality: null,
  notes: "",
});

export function TaskWizard({
  open,
  editing,
  initialTemplate,
  workers,
  onClose,
  onSave,
}: {
  open: boolean;
  editing?: LabourTask | null;
  initialTemplate?: TaskTemplate | null;
  workers: Worker[];
  onClose: () => void;
  onSave: (task: LabourTask) => void;
}) {
  const [step, setStep] = useState(0);
  const [task, setTask] = useState<LabourTask>(blankTask);
  const steps = [
    "Task details",
    "Assign people",
    "Pay & budget",
    "Instructions",
  ];

  useEffect(() => {
    if (!open) return;
    const base = editing
      ? {
          ...editing,
          workerIds: [...editing.workerIds],
          tools: [...editing.tools],
        }
      : blankTask();
    const withTemplate =
      initialTemplate && !editing
        ? {
            ...base,
            title: initialTemplate.name,
            type: initialTemplate.type,
            duration: initialTemplate.defaultDuration,
            rateAmount: initialTemplate.defaultRate,
            rateType: initialTemplate.rateType,
            workerIds: workers
              .slice(0, initialTemplate.defaultWorkers)
              .map((worker) => worker.id),
            estimatedTotal:
              initialTemplate.defaultWorkers * initialTemplate.defaultRate,
          }
        : base;
    setTask(withTemplate);
    setStep(0);
  }, [open, editing, initialTemplate, workers]);

  const update = <K extends keyof LabourTask>(key: K, value: LabourTask[K]) =>
    setTask((current) => ({ ...current, [key]: value }));
  const toggleWorker = (id: string) =>
    setTask((current) => ({
      ...current,
      workerIds: current.workerIds.includes(id)
        ? current.workerIds.filter((workerId) => workerId !== id)
        : [...current.workerIds, id],
    }));
  const toggleTool = (tool: string) =>
    setTask((current) => ({
      ...current,
      tools: current.tools.includes(tool)
        ? current.tools.filter((item) => item !== tool)
        : [...current.tools, tool],
    }));
  const estimatedTotal =
    task.rateType === "Daily rate"
      ? task.workerIds.length * task.rateAmount
      : Math.max(task.rateAmount, 0) * Math.max(task.workerIds.length, 1);
  const canNext =
    step === 0
      ? Boolean(task.title && task.crop && task.date)
      : step === 1
        ? task.workerIds.length > 0
        : step === 3
          ? Boolean(task.instructions && task.tools.length > 0)
          : true;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit scheduled task" : "Create a labour task"}
      desc="Build a complete job card before it reaches a worker's phone."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <Field label="Task name" className="col-md-8">
            <TextInput
              value={task.title}
              placeholder="e.g. Weeding cabbage — second pass"
              onChange={(value) => update("title", value)}
            />
          </Field>
          <Field label="Task type" className="col-md-4">
            <SelectInput
              value={task.type}
              onChange={(value) => update("type", value as TaskType)}
              options={[...TASK_TYPES]}
            />
          </Field>
          <Field label="Crop / enterprise" className="col-md-6">
            <TextInput
              value={task.crop}
              placeholder="Cabbage Gloria F1"
              onChange={(value) => update("crop", value)}
            />
          </Field>
          <Field label="Plot or location" className="col-md-6">
            <TextInput
              value={task.plot}
              onChange={(value) => update("plot", value)}
            />
          </Field>
          <Field label="Date" className="col-md-4">
            <TextInput
              value={task.date}
              placeholder="18 Nov 2026"
              onChange={(value) => update("date", value)}
            />
          </Field>
          <Field label="Start time" className="col-md-4">
            <TextInput
              value={task.startTime}
              type="time"
              onChange={(value) => update("startTime", value)}
            />
          </Field>
          <Field label="Duration" className="col-md-4">
            <SelectInput
              value={task.duration}
              onChange={(value) => update("duration", value)}
              options={["2 hrs", "Half day", "Full day", "Multi-day"]}
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-1">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <span className="gm-eyebrow">Worker assignment</span>
              <h3 className="font-display mb-1">Who should do this work?</h3>
            </div>
            <StatusChip
              label={`${task.workerIds.length} selected`}
              tone={task.workerIds.length ? "low" : "high"}
            />
          </div>
          <div className="row g-2 mt-2">
            {workers
              .filter((worker) => worker.status !== "inactive")
              .map((worker) => (
                <div className="col-md-6" key={worker.id}>
                  <label
                    className={`gm-check-row ${task.workerIds.includes(worker.id) ? "is-checked" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={task.workerIds.includes(worker.id)}
                      onChange={() => toggleWorker(worker.id)}
                    />
                    <WorkerAvatar worker={worker} />
                    <span style={{ flex: 1 }}>
                      <strong>{worker.name}</strong>
                      <small>
                        {worker.id} · {worker.skills.slice(0, 2).join(" · ")} ·{" "}
                        {kes(worker.dailyRate)}/day
                      </small>
                    </span>
                    <small>
                      {worker.rating ? `${worker.rating}/5` : "New"}
                    </small>
                  </label>
                </div>
              ))}
          </div>
          <div className="gm-check-row mt-3">
            <Info />
            <span>
              <strong>Assignment tip</strong>
              <small>
                Esther is on leave until 18 Nov; the scheduler will still show
                the conflict before you save.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-1">
          <div className="row g-3">
            <Field label="Rate model" className="col-md-6">
              <SelectInput
                value={task.rateType}
                onChange={(value) => update("rateType", value as RateType)}
                options={["Daily rate", "Piece rate"]}
              />
            </Field>
            <Field
              label={
                task.rateType === "Daily rate"
                  ? "Rate per worker / day (KES)"
                  : "Piece amount (KES)"
              }
              className="col-md-6"
            >
              <TextInput
                type="number"
                value={task.rateAmount}
                onChange={(value) => update("rateAmount", Number(value))}
              />
            </Field>
            <Field label="Budget category" className="col-md-6">
              <SelectInput
                value={task.budgetCategory}
                onChange={(value) => update("budgetCategory", value)}
                options={[
                  "Cabbage labour",
                  "Maize labour",
                  "Tomato labour",
                  "Potato labour",
                  "Beans labour",
                  "Crop protection labour",
                  "Harvest labour",
                ]}
              />
            </Field>
            <Field label="Payment method" className="col-md-6">
              <SelectInput
                value={task.paymentMethod}
                onChange={(value) => update("paymentMethod", value)}
                options={[
                  "GrowMO wallet · M-Pesa",
                  "Manual (I'll pay offline)",
                  "Cash with receipt",
                ]}
              />
            </Field>
            <Field label="Payment timing" className="col-md-6">
              <SelectInput
                value={task.paymentTiming}
                onChange={(value) => update("paymentTiming", value)}
                options={[
                  "On completion",
                  "Pay on completion",
                  "End of task",
                  "On scheduled date",
                ]}
              />
            </Field>
          </div>
          <div className="gm-plan-total mt-3">
            <div>
              <span>Calculated total</span>
              <strong className="font-display">{kes(estimatedTotal)}</strong>
            </div>
            <div className="text-end">
              <span>
                {task.workerIds.length} worker
                {task.workerIds.length === 1 ? "" : "s"}
              </span>
              <small className="d-block">
                {task.rateType} · {kes(task.rateAmount)} input rate
              </small>
            </div>
          </div>
          <div className="gm-check-row mt-3">
            <WalletCards />
            <span>
              <strong>Auto-pay simulation ready</strong>
              <small>
                Once attendance and quality are confirmed, this task can create
                a pending M-Pesa payroll row.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="mt-1">
          <Field
            label="Instructions for the team"
            hint="Include crop safety, quality or spacing instructions."
          >
            <textarea
              className="gm-input"
              rows={4}
              value={task.instructions}
              placeholder="Keep the cabbage crown clear and report any pest pressure..."
              onChange={(event) => update("instructions", event.target.value)}
            />
          </Field>
          <span className="gm-field-label mt-2 d-block">
            Required tools and PPE
          </span>
          <div className="row g-2 mt-1">
            {REQUIRED_TOOLS.map((tool) => (
              <div className="col-sm-6 col-lg-3" key={tool}>
                <CheckOption
                  checked={task.tools.includes(tool)}
                  onChange={() => toggleTool(tool)}
                  label={tool}
                />
              </div>
            ))}
          </div>
          <Field label="Internal note" className="mt-3">
            <TextInput
              value={task.notes}
              placeholder="Weather window, buyer deadline or reassignment note"
              onChange={(value) => update("notes", value)}
            />
          </Field>
          <div className="gm-ai-callout mt-3">
            <Sparkles />
            <span>
              <strong>GrowMO suggestion</strong>
              <small>
                Send the task reminder the evening before and ask workers to
                confirm from their phone.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={steps.length - 1}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onNext={() => {
          if (step < steps.length - 1) setStep((current) => current + 1);
          else {
            onSave({ ...task, estimatedTotal });
            onClose();
          }
        }}
        nextDisabled={!canNext}
        finishLabel={editing ? "Save changes" : "Create task"}
      />
    </Dialog>
  );
}

export function TaskTemplateDialog({
  open,
  onClose,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  onUse: (template: TaskTemplate) => void;
}) {
  const [selected, setSelected] = useState(TASK_TEMPLATES[0].id);
  const template =
    TASK_TEMPLATES.find((item) => item.id === selected) ?? TASK_TEMPLATES[0];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Start with a task template"
      desc="Templates prefill a safe rate and a sensible team size. You can edit every field before sending."
      wide
    >
      <div className="row g-2">
        {TASK_TEMPLATES.map((item) => (
          <div className="col-md-6" key={item.id}>
            <button
              type="button"
              className={`gm-option-row w-100 text-start ${selected === item.id ? "is-selected" : ""}`}
              onClick={() => setSelected(item.id)}
            >
              <span className="gm-mega-icon">
                <Wrench />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <small>
                  {item.defaultWorkers} workers · {item.defaultDuration} ·{" "}
                  {kes(item.defaultRate)} · {item.rateType}
                </small>
              </span>
              <ChevronRight />
            </button>
          </div>
        ))}
      </div>
      <div className="gm-plan-detail-hero mt-3">
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">Selected template</span>
          <h3 className="font-display mb-1">{template.name}</h3>
          <p className="mb-0 text-muted">{template.note}</p>
        </div>
        <StatusChip label={`${template.defaultWorkers} workers`} tone="low" />
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onUse(template)}
        >
          Use template <ChevronRight />
        </button>
      </div>
    </Dialog>
  );
}

export function TaskCompletionWizard({
  open,
  task,
  workers,
  onClose,
  onComplete,
}: {
  open: boolean;
  task: LabourTask | null;
  workers: Worker[];
  onClose: () => void;
  onComplete: (task: LabourTask, photoNote: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [attendance, setAttendance] = useState<
    Record<string, { status: AttendanceStatus; hours: number }>
  >({});
  const [quality, setQuality] = useState("5");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(false);
  const steps = ["Attendance", "Quality", "Review"];

  useEffect(() => {
    if (!open || !task) return;
    setStep(0);
    setAttendance(
      Object.fromEntries(
        task.workerIds.map((id) => [
          id,
          {
            status: "Present",
            hours:
              task.duration === "2 hrs"
                ? 2
                : task.duration === "Half day"
                  ? 4
                  : 8,
          },
        ]),
      ),
    );
    setQuality(task.quality ? String(task.quality) : "5");
    setNote(task.notes);
    setPhoto(false);
  }, [open, task]);

  if (!task) return null;
  const taskWorkers = workers.filter((worker) =>
    task.workerIds.includes(worker.id),
  );
  const updateAttendance = (
    id: string,
    key: "status" | "hours",
    value: string | number,
  ) =>
    setAttendance((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }));
  const presentCount = Object.values(attendance).filter(
    (item) => item.status === "Present" || item.status === "Late",
  ).length;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Complete task · ${task.title}`}
      desc="Attendance becomes the payroll source of truth. Review it before the M-Pesa run."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="mt-1">
          <div className="gm-check-row">
            <CheckCircle2 />
            <span>
              <strong>
                {task.date} · {task.crop}
              </strong>
              <small>
                {task.plot} · {task.duration} · {taskWorkers.length} assigned
              </small>
            </span>
          </div>
          <div className="row g-2 mt-2">
            {taskWorkers.map((worker) => {
              const entry = attendance[worker.id] ?? {
                status: "Pending" as AttendanceStatus,
                hours: 0,
              };
              return (
                <div className="col-md-6" key={worker.id}>
                  <div className="gm-card p-3">
                    <div className="d-flex align-items-center gap-2">
                      <WorkerAvatar worker={worker} />
                      <span style={{ flex: 1 }}>
                        <strong>{worker.name}</strong>
                        <small className="d-block text-muted">
                          {worker.id} · {worker.phone}
                        </small>
                      </span>
                    </div>
                    <div className="row g-2 mt-2">
                      <div className="col-7">
                        <span className="gm-field-label">Status</span>
                        <select
                          id={`completion-status-${worker.id}`}
                          className="gm-select"
                          value={entry.status}
                          onChange={(event) =>
                            updateAttendance(
                              worker.id,
                              "status",
                              event.target.value,
                            )
                          }
                        >
                          <option>Present</option>
                          <option>Late</option>
                          <option>Absent</option>
                        </select>
                      </div>
                      <div className="col-5">
                        <span className="gm-field-label">Hours</span>
                        <input
                          id={`completion-hours-${worker.id}`}
                          className="gm-input"
                          type="number"
                          min="0"
                          max="12"
                          step="0.5"
                          value={entry.hours}
                          onChange={(event) =>
                            updateAttendance(
                              worker.id,
                              "hours",
                              Number(event.target.value),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm mt-3"
            onClick={() =>
              setAttendance((current) =>
                Object.fromEntries(
                  Object.keys(current).map((id) => [
                    id,
                    {
                      status: "Present",
                      hours:
                        task.duration === "2 hrs"
                          ? 2
                          : task.duration === "Half day"
                            ? 4
                            : 8,
                    },
                  ]),
                ),
              )
            }
          >
            Mark all present
          </button>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-1">
          <Field
            label="Quality score"
            hint="Rate crop handling, completion and clean-up from 1 to 5."
          >
            <div className="d-flex gap-2">
              {["1", "2", "3", "4", "5"].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`gm-btn ${quality === value ? "gm-btn-lime" : "gm-btn-outline"}`}
                  onClick={() => setQuality(value)}
                >
                  {value} / 5
                </button>
              ))}
            </div>
          </Field>
          <Field label="Completion note" className="mt-3">
            <textarea
              className="gm-input"
              rows={4}
              value={note}
              placeholder="What did the field check show?"
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <label className="gm-check-row mt-3" style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={(event) =>
                setPhoto(Boolean(event.target.files?.length))
              }
            />
            <ImagePlus />
            <span>
              <strong>
                {photo ? "Completion photo attached" : "Add a completion photo"}
              </strong>
              <small>
                {photo
                  ? "The selected image is attached to this simulated record."
                  : "Choose a field image, or continue without one."}
              </small>
            </span>
          </label>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-1">
          <div className="gm-plan-total">
            <div>
              <span>Workers present</span>
              <strong className="font-display">
                {presentCount} / {taskWorkers.length}
              </strong>
            </div>
            <div className="text-end">
              <span>Quality</span>
              <strong className="font-display">{quality} / 5</strong>
            </div>
          </div>
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Estimated pay</th>
                </tr>
              </thead>
              <tbody>
                {taskWorkers.map((worker) => {
                  const entry = attendance[worker.id];
                  const amount =
                    entry.status === "Absent"
                      ? 0
                      : task.rateType === "Daily rate"
                        ? task.rateAmount
                        : task.rateAmount;
                  return (
                    <tr key={worker.id}>
                      <td>
                        <strong>{worker.name}</strong>
                        <small className="d-block text-muted">
                          {worker.id}
                        </small>
                      </td>
                      <td>
                        <StatusChip
                          label={entry.status}
                          tone={
                            entry.status === "Present"
                              ? "low"
                              : entry.status === "Absent"
                                ? "high"
                                : "medium"
                          }
                        />
                      </td>
                      <td>{entry.hours} hrs</td>
                      <td className="font-display">{kes(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="gm-check-row mt-3">
            <Smartphone />
            <span>
              <strong>Auto-pay will be prepared</strong>
              <small>
                {presentCount} worker{presentCount === 1 ? "" : "s"} will move
                to pending payroll. The final send still requires OTP and PIN.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={steps.length - 1}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onNext={() => {
          if (step < steps.length - 1) setStep((current) => current + 1);
          else {
            const nextTask = {
              ...task,
              status: "Completed" as const,
              quality: Number(quality),
              actualHours: Object.values(attendance).reduce(
                (sum, entry) => sum + Number(entry.hours),
                0,
              ),
              notes: note,
              attendance: task.workerIds.map((workerId) => ({
                workerId,
                status: attendance[workerId]?.status ?? "Pending",
                hours: attendance[workerId]?.hours ?? 0,
                confirmed: true,
                note: note,
              })),
            };
            onComplete(
              nextTask,
              photo ? "Completion photo attached" : "No photo attached",
            );
            onClose();
          }
        }}
        finishLabel="Complete & prepare pay"
      />
    </Dialog>
  );
}

export function AttendanceWizard({
  open,
  date,
  records,
  onClose,
  onSave,
}: {
  open: boolean;
  date: string;
  records: AttendanceRecord[];
  onClose: () => void;
  onSave: (records: AttendanceRecord[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<AttendanceRecord[]>(records);
  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft(records.map((record) => ({ ...record })));
    }
  }, [open, records]);
  const setStatus = (id: string, status: AttendanceStatus) =>
    setDraft((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, status, confirmed: status !== "Pending" }
          : record,
      ),
    );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Confirm attendance · ${date}`}
      desc="Bulk marking is a shortcut; you can still correct each worker before saving."
      wide
    >
      <Stepper steps={["Mark", "Review"]} current={step} />
      {step === 0 ? (
        <div className="row g-2 mt-1">
          {draft.map((record) => (
            <div className="col-md-6" key={record.id}>
              <div className="gm-card p-3">
                <div className="d-flex justify-content-between gap-2">
                  <span>
                    <strong>{record.workerName}</strong>
                    <small className="d-block text-muted">
                      {record.taskTitle}
                    </small>
                  </span>
                  <StatusChip
                    label={record.status}
                    tone={
                      record.status === "Present"
                        ? "low"
                        : record.status === "Absent"
                          ? "high"
                          : "medium"
                    }
                  />
                </div>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {(["Present", "Late", "Absent"] as AttendanceStatus[]).map(
                    (status) => (
                      <button
                        type="button"
                        className={`gm-btn gm-btn-sm ${record.status === status ? "gm-btn-lime" : "gm-btn-outline"}`}
                        key={status}
                        onClick={() => setStatus(record.id, status)}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
                <Field label="Actual hours" className="mt-3">
                  <TextInput
                    type="number"
                    value={record.actualHours}
                    onChange={(value) =>
                      setDraft((current) =>
                        current.map((item) =>
                          item.id === record.id
                            ? { ...item, actualHours: Number(value) }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-1">
          <div className="gm-plan-total">
            <div>
              <span>Present or late</span>
              <strong className="font-display">
                {
                  draft.filter(
                    (record) =>
                      record.status === "Present" || record.status === "Late",
                  ).length
                }
              </strong>
            </div>
            <div>
              <span>Absent</span>
              <strong className="font-display">
                {draft.filter((record) => record.status === "Absent").length}
              </strong>
            </div>
            <div>
              <span>Hours</span>
              <strong className="font-display">
                {draft.reduce((sum, record) => sum + record.actualHours, 0)}
              </strong>
            </div>
          </div>
          <div className="gm-check-row mt-3">
            <CheckCircle2 />
            <span>
              <strong>Attendance is ready to save</strong>
              <small>
                The payroll tab will use these confirmed hours to calculate the
                next payment run.
              </small>
            </span>
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep(0)}
        onNext={() => {
          if (step === 0) setStep(1);
          else {
            onSave(draft);
            onClose();
          }
        }}
        finishLabel="Save attendance"
      />
    </Dialog>
  );
}

function PaymentStatusRow({ payment }: { payment: PayrollPayment }) {
  const tone =
    payment.status === "Paid"
      ? "low"
      : payment.status === "Pending"
        ? "high"
        : payment.status === "Scheduled"
          ? "medium"
          : "neutral";
  return (
    <div className="gm-check-row">
      <span className="gm-mega-icon">
        <WalletCards />
      </span>
      <span style={{ flex: 1 }}>
        <strong>{payment.workerName}</strong>
        <small>
          {payment.task} · {payment.dueDate}
        </small>
      </span>
      <span className="text-end">
        <strong className="font-display d-block">{kes(payment.amount)}</strong>
        <StatusChip label={payment.status} tone={tone} />
      </span>
    </div>
  );
}

export function PaymentWizard({
  open,
  payments,
  onClose,
  onPaid,
}: {
  open: boolean;
  payments: PayrollPayment[];
  onClose: () => void;
  onPaid: (ids: string[], receipt: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");
  const steps = ["Review", "Confirm", "PIN", "Receipt"];
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  useEffect(() => {
    if (open) {
      setStep(0);
      setOtp("");
      setProcessing(false);
      setReceipt("");
    }
  }, [open]);
  const completePin = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const nextReceipt = `MP${String(Date.now()).slice(-8)}`;
      setReceipt(nextReceipt);
      setProcessing(false);
      setStep(3);
      onPaid(
        payments.map((payment) => payment.id),
        nextReceipt,
      );
    }, 900);
  };
  return (
    <Dialog
      open={open}
      onClose={processing ? () => undefined : onClose}
      title={
        payments.length > 1
          ? "Batch M-Pesa payment"
          : "M-Pesa payment confirmation"
      }
      desc="This is a safe simulation — no real money leaves the GrowMO wallet."
      dismissable={!processing}
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="mt-1">
          <div className="gm-plan-total">
            <div>
              <span>
                {payments.length} payment{payments.length === 1 ? "" : "s"}
              </span>
              <strong className="font-display">{kes(total)}</strong>
            </div>
            <div className="text-end">
              <span>From</span>
              <strong className="d-block">GrowMO wallet</strong>
            </div>
          </div>
          <div className="mt-3">
            {payments.map((payment) => (
              <PaymentStatusRow key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-1">
          <div className="gm-check-row">
            <Smartphone />
            <span>
              <strong>OTP sent to Mary's phone</strong>
              <small>
                Use the demo code 123456 to verify this payroll batch.
              </small>
            </span>
            <StatusChip label="SMS sent" tone="low" />
          </div>
          <div className="mt-3">
            <OtpInput
              value={otp}
              onChange={setOtp}
              label="Enter 6-digit verification code"
            />
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-1 text-center">
          <h3 className="font-display">Enter wallet PIN</h3>
          <p className="text-muted">
            The PIN is local to this simulation. It is never stored.
          </p>
          {processing ? (
            <div className="py-4">
              <LoaderCircle className="gm-spin" />
              <strong className="d-block mt-2">
                Confirming M-Pesa payment…
              </strong>
              <small className="text-muted">
                Updating payroll and receipt records.
              </small>
            </div>
          ) : (
            <PinPad
              onComplete={completePin}
              actionLabel={`Pay ${kes(total)} securely`}
            />
          )}
        </div>
      ) : null}
      {step === 3 ? (
        <div className="mt-1 text-center">
          <CheckCircle2
            style={{ color: "var(--gm-leaf-600)", width: 54, height: 54 }}
          />
          <span className="gm-eyebrow d-block mt-2">Payment complete</span>
          <h3 className="font-display">M-Pesa receipt {receipt}</h3>
          <p className="text-muted">
            {kes(total)} has moved from pending to paid. Worker records and the
            payroll activity feed are updated.
          </p>
          <div className="gm-plan-payment-receipt text-start mt-3">
            <div>
              <span>Receipt</span>
              <strong>{receipt}</strong>
            </div>
            <div>
              <span>Workers</span>
              <strong>
                {payments
                  .map((payment) => payment.workerName.split(" ")[0])
                  .join(", ")}
              </strong>
            </div>
            <div>
              <span>Time</span>
              <strong>
                {new Date().toLocaleString("en-KE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </strong>
            </div>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-lime mt-3"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      ) : null}
      {step < 2 ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          onNext={() => setStep((current) => current + 1)}
          nextDisabled={step === 1 && otp.length < 6}
          nextLabel={step === 1 ? "Continue to PIN" : "Continue"}
        />
      ) : null}
    </Dialog>
  );
}

export function AdvanceWizard({
  open,
  worker,
  onClose,
  onComplete,
}: {
  open: boolean;
  worker: Worker | null;
  onClose: () => void;
  onComplete: (worker: Worker, amount: number, receipt: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("1000");
  const [reason, setReason] = useState("Transport advance");
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");
  useEffect(() => {
    if (open) {
      setStep(0);
      setAmount("1000");
      setReason("Transport advance");
      setOtp("");
      setReceipt("");
    }
  }, [open]);
  if (!worker) return null;
  const confirmPin = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const next = `ADV${String(Date.now()).slice(-7)}`;
      setReceipt(next);
      setProcessing(false);
      setStep(3);
      onComplete(worker, Number(amount), next);
    }, 900);
  };
  return (
    <Dialog
      open={open}
      onClose={processing ? () => undefined : onClose}
      title={`Advance · ${worker.name}`}
      desc="Send a documented M-Pesa advance and keep it attached to the worker ledger."
      dismissable={!processing}
    >
      <Stepper steps={["Amount", "OTP", "PIN", "Receipt"]} current={step} />
      {step === 0 ? (
        <div className="mt-1">
          <div className="d-flex align-items-center gap-3 gm-plan-detail-hero">
            <WorkerAvatar worker={worker} />
            <div>
              <span className="gm-eyebrow">Worker wallet</span>
              <h3 className="font-display mb-1">{worker.name}</h3>
              <p className="mb-0 text-muted">
                {worker.phone} · {worker.preferredPayment}
              </p>
            </div>
          </div>
          <div className="row g-3 mt-1">
            <Field label="Advance amount (KES)" className="col-md-6">
              <TextInput type="number" value={amount} onChange={setAmount} />
            </Field>
            <Field label="Reason" className="col-md-6">
              <TextInput value={reason} onChange={setReason} />
            </Field>
          </div>
          <div className="gm-check-row mt-3">
            <Info />
            <span>
              <strong>Available wallet balance: {kes(35000)}</strong>
              <small>
                This advance will appear as a pending payroll item until settled
                against a task.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-2">
          <div className="gm-check-row">
            <Smartphone />
            <span>
              <strong>OTP sent to {worker.phone}</strong>
              <small>Use demo code 123456.</small>
            </span>
          </div>
          <div className="mt-3">
            <OtpInput value={otp} onChange={setOtp} />
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="text-center mt-2">
          {processing ? (
            <div className="py-4">
              <LoaderCircle className="gm-spin" />
              <strong className="d-block mt-2">Sending secure advance…</strong>
            </div>
          ) : (
            <PinPad
              onComplete={confirmPin}
              actionLabel={`Send ${kes(Number(amount) || 0)} to ${worker.name.split(" ")[0]}`}
            />
          )}
        </div>
      ) : null}
      {step === 3 ? (
        <div className="text-center mt-2">
          <CheckCircle2
            style={{ color: "var(--gm-leaf-600)", width: 52, height: 52 }}
          />
          <h3 className="font-display mt-2">Advance sent</h3>
          <p className="text-muted">
            Receipt {receipt} · {kes(Number(amount))} · {reason}
          </p>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      ) : null}
      {step < 2 ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          onNext={() => setStep((current) => current + 1)}
          nextDisabled={
            step === 0 ? Number(amount) < 50 : step === 1 && otp.length < 6
          }
          nextLabel={step === 1 ? "Continue to PIN" : "Continue"}
        />
      ) : null}
    </Dialog>
  );
}

export function EditPaymentDialog({
  open,
  payment,
  onClose,
  onSave,
}: {
  open: boolean;
  payment: PayrollPayment | null;
  onClose: () => void;
  onSave: (payment: PayrollPayment) => void;
}) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("Scheduled");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open && payment) {
      setDate(payment.scheduledDate ?? payment.dueDate);
      setStatus(payment.status);
      setNote(payment.note);
    }
  }, [open, payment]);
  if (!payment) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Edit payment · ${payment.workerName}`}
      desc="Change the scheduled date or hold this payment until attendance is resolved."
    >
      <div className="row g-3">
        <Field label="Payment status" className="col-md-6">
          <SelectInput
            value={status}
            onChange={(value) => setStatus(value as PaymentStatus)}
            options={["Pending", "Scheduled", "Future"]}
          />
        </Field>
        <Field label="Scheduled / due date" className="col-md-6">
          <TextInput value={date} onChange={setDate} />
        </Field>
        <Field label="Payroll note" className="col-12">
          <textarea
            className="gm-input"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => {
            onSave({ ...payment, status, scheduledDate: date, note });
            onClose();
          }}
        >
          Save payment
        </button>
      </div>
    </Dialog>
  );
}

export function SettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: LabourSettings;
  onClose: () => void;
  onSave: (settings: LabourSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);
  const update = <K extends keyof LabourSettings>(
    key: K,
    value: LabourSettings[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Labour & payroll settings"
      desc="Keep reminders, attendance cut-off and payment defaults in one place."
    >
      <div className="d-grid gap-2">
        <Toggle
          checked={draft.autoPay}
          onChange={(value) => update("autoPay", value)}
          label="Prepare auto-pay after completion"
          desc="Create a pending M-Pesa row when attendance is confirmed."
        />
        <Toggle
          checked={draft.smsReminders}
          onChange={(value) => update("smsReminders", value)}
          label="Send worker SMS reminders"
          desc="Send the evening-before task and attendance reminders."
        />
        <Toggle
          checked={draft.requirePhoto}
          onChange={(value) => update("requirePhoto", value)}
          label="Require a completion photo"
          desc="Do not mark a task complete until a photo is attached."
        />
        <Toggle
          checked={draft.sendPayslip}
          onChange={(value) => update("sendPayslip", value)}
          label="Send a payslip receipt"
          desc="Worker receives the payment reference after settlement."
        />
      </div>
      <div className="row g-3 mt-2">
        <Field label="Attendance cut-off" className="col-md-6">
          <TextInput
            type="time"
            value={draft.attendanceCutoff}
            onChange={(value) => update("attendanceCutoff", value)}
          />
        </Field>
        <Field label="Default rate (KES)" className="col-md-6">
          <TextInput
            type="number"
            value={draft.defaultRate}
            onChange={(value) => update("defaultRate", Number(value))}
          />
        </Field>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
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
          Save settings
        </button>
      </div>
    </Dialog>
  );
}

export function NotifyWorkersDialog({
  open,
  workers,
  onClose,
  onSend,
}: {
  open: boolean;
  workers: Worker[];
  onClose: () => void;
  onSend: (audience: string, message: string) => void;
}) {
  const [audience, setAudience] = useState("Today's assigned workers");
  const [message, setMessage] = useState(
    "Mambo! Reminder from Wanjiku Mixed Farm: please confirm your labour task in GrowMO before 18:00. Asante.",
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Send a worker update"
      desc="The message is ready for SMS simulation; no live SMS is sent from this demo."
    >
      <Field label="Audience">
        <SelectInput
          value={audience}
          onChange={setAudience}
          options={[
            "Today's assigned workers",
            "All active workers",
            "Workers with pending attendance",
            ...workers.slice(0, 3).map((worker) => worker.name),
          ]}
        />
      </Field>
      <Field label="Message" hint={`${message.length}/160 characters`}>
        <textarea
          className="gm-input"
          rows={4}
          maxLength={160}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Field>
      <div className="gm-check-row mt-3">
        <MessageSquare />
        <span>
          <strong>SMS preview</strong>
          <small>{message}</small>
        </span>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => {
            onSend(audience, message);
            onClose();
          }}
        >
          Send simulated SMS
        </button>
      </div>
    </Dialog>
  );
}

export function ExportDialog({
  open,
  onClose,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "print") => void;
}) {
  const [format, setFormat] = useState<"csv" | "print">("csv");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export labour records"
      desc="Download the current view for your farm file or print it for a field review."
    >
      <div className="row g-2">
        <div className="col-md-6">
          <button
            type="button"
            className={`gm-option-row w-100 text-start ${format === "csv" ? "is-selected" : ""}`}
            onClick={() => setFormat("csv")}
          >
            <FileText />
            <span>
              <strong>CSV payroll file</strong>
              <small>Worker IDs, task, amount and status.</small>
            </span>
          </button>
        </div>
        <div className="col-md-6">
          <button
            type="button"
            className={`gm-option-row w-100 text-start ${format === "print" ? "is-selected" : ""}`}
            onClick={() => setFormat("print")}
          >
            <FileText />
            <span>
              <strong>Print summary</strong>
              <small>A clean review page for the farm folder.</small>
            </span>
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => {
            onExport(format);
            onClose();
          }}
        >
          Export records
        </button>
      </div>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  desc,
  confirmLabel = "Confirm",
  danger = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  desc: string;
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={desc}>
      <div className="gm-check-row">
        <Info />
        <span>
          <strong>This action is recorded</strong>
          <small>
            You can continue working; the activity feed will show the change.
          </small>
        </span>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`gm-btn ${danger ? "gm-btn-danger-soft" : "gm-btn-lime"}`}
          onClick={() => {
            onClose();
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

export function BenchmarkDialog({
  open,
  county,
  insight,
  onClose,
}: {
  open: boolean;
  county: string;
  insight: string;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${county} labour benchmark`}
      desc="Benchmark figures are planning ranges, not a wage promise."
    >
      <LabourInsight
        eyebrow="County context"
        title="Pay for reliability, not just a low headline rate"
        body={insight}
      />
      <div className="gm-check-row mt-3">
        <Sparkles />
        <span>
          <strong>Action in GrowMO</strong>
          <small>
            Add a skill premium, transport line or piece-rate bonus to the task
            card so the worker sees the whole offer.
          </small>
        </span>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Got it
        </button>
      </div>
    </Dialog>
  );
}
