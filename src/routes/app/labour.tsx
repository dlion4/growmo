/* ============================================================================
   PAGE 6 — LABOUR MANAGEMENT & PAYROLL (ENHANCED)  (/app/labour)

   Blueprint sections implemented:
   6.1 Worker directory       6.2 Task scheduler
   6.3 Labour calendar        6.4 Attendance & completion
   6.5 Payroll dashboard      6.6 Full-season cost forecast
   6.7 County labour benchmarks

   The route deliberately keeps worker, task, attendance and payment records in
   local state so every drawer, dialog, simulated M-Pesa receipt and export
   action has a visible result without needing a backend.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  BarChart3,
  BellRing,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  HandCoins,
  ListChecks,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  AdvanceWizard,
  AttendanceWizard,
  BenchmarkDialog,
  ConfirmDialog,
  EditPaymentDialog,
  ExportDialog,
  NotifyWorkersDialog,
  PaymentWizard,
  SettingsDialog,
  TaskCompletionWizard,
  TaskTemplateDialog,
  TaskWizard,
  WorkerWizard,
} from "../../components/app/LabourModals";
import {
  LabourBudgetBar,
  LabourCalendar,
  LabourHeaderCard,
  LabourInsight,
  LabourLocationLine,
  LabourQuickMetric,
  LabourStatusPill,
  LabourTimeLine,
  LabourWorkerLine,
  PayrollBarChart,
} from "../../components/app/LabourWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal, Stars } from "../../components/ui/primitives";
import {
  ATTENDANCE_RECORDS,
  type AttendanceRecord,
  type AttendanceStatus,
  attendanceTone,
  FARM_LABOUR_CONTEXT,
  LABOUR_BENCHMARKS,
  LABOUR_FORECAST,
  LABOUR_SETTINGS,
  LABOUR_TASKS,
  type LabourBenchmark,
  type LabourSettings,
  type LabourTask,
  PAYROLL_ACTIVITY,
  PAYROLL_PAYMENTS,
  type PaymentStatus,
  type PayrollPayment,
  paymentStatusTone,
  type TaskStatus,
  type TaskTemplate,
  WORKER_SKILLS,
  WORKERS,
  type Worker,
  type WorkerStatus,
} from "../../data/app/labour";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/labour")({
  component: LabourManagementPage,
});

type LabourView =
  | "workers"
  | "scheduler"
  | "calendar"
  | "attendance"
  | "payroll"
  | "forecast"
  | "benchmarks";
type DrawerId = "worker" | "task" | "day" | "receipt" | "activity" | null;
type ModalId =
  | "worker"
  | "edit-worker"
  | "deactivate-worker"
  | "task"
  | "templates"
  | "edit-task"
  | "reschedule-task"
  | "delete-task"
  | "complete-task"
  | "attendance"
  | "pay"
  | "batch-pay"
  | "edit-payment"
  | "advance"
  | "settings"
  | "notify"
  | "export"
  | "benchmark"
  | null;

type CalendarDay = {
  day: number;
  date: string;
  outside?: boolean;
  tasks: LabourTask[];
};

function money(value: number) {
  return kes(Math.round(value));
}

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function taskDateKey(label: string) {
  const date = new Date(label);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

function calendarDays(cursor: Date, tasks: LabourTask[]): CalendarDay[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const start = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const dayDate = new Date(year, month, index - start + 1);
    const date = monthDateKey(dayDate);
    return {
      day: dayDate.getDate(),
      date,
      outside: dayDate.getMonth() !== month,
      tasks: tasks.filter((task) => taskDateKey(task.date) === date),
    };
  });
}

function toneForWorker(
  status: WorkerStatus,
): "low" | "medium" | "high" | "neutral" {
  return status === "active"
    ? "low"
    : status === "on-leave"
      ? "medium"
      : "neutral";
}

function statusLabel(status: WorkerStatus) {
  return status === "on-leave"
    ? "On leave"
    : status === "inactive"
      ? "Inactive"
      : "Active";
}

function phoneHref(phone: string) {
  return `tel:+254${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}

function smsHref(phone: string, body: string) {
  return `sms:+254${phone.replace(/\D/g, "").replace(/^0/, "")}?body=${encodeURIComponent(body)}`;
}

function LabourManagementPage() {
  const toast = useToast();
  const [view, setView] = useState<LabourView>("workers");
  const [workers, setWorkers] = useState<Worker[]>(WORKERS);
  const [tasks, setTasks] = useState<LabourTask[]>(LABOUR_TASKS);
  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>(ATTENDANCE_RECORDS);
  const [payments, setPayments] = useState<PayrollPayment[]>(PAYROLL_PAYMENTS);
  const [settings, setSettings] = useState<LabourSettings>(LABOUR_SETTINGS);
  const [menu, setMenu] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("W-001");
  const [selectedTaskId, setSelectedTaskId] = useState("task-004");
  const [selectedPaymentId, setSelectedPaymentId] = useState("pay-004");
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(
    null,
  );
  const [selectedBenchmark, setSelectedBenchmark] = useState<LabourBenchmark>(
    LABOUR_BENCHMARKS[0],
  );
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | "all">("all");
  const [workerSkill, setWorkerSkill] = useState("All skills");
  const [workerPage, setWorkerPage] = useState(1);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus | "all">("all");
  const [taskPage, setTaskPage] = useState(1);
  const [attendanceQuery, setAttendanceQuery] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState<
    AttendanceStatus | "all"
  >("all");
  const [attendancePage, setAttendancePage] = useState(1);
  const [payrollQuery, setPayrollQuery] = useState("");
  const [payrollStatus, setPayrollStatus] = useState<PaymentStatus | "all">(
    "all",
  );
  const [payrollPage, setPayrollPage] = useState(1);
  const [calendarCursor, setCalendarCursor] = useState(new Date(2026, 10, 1));
  const [forecastCrop, setForecastCrop] = useState("Cabbage");

  useEffect(() => {
    if (modal || drawer)
      window.dispatchEvent(new Event("close-appshell-drawers"));
  }, [modal, drawer]);

  useEffect(() => {
    if (!rowMenu) return;
    const close = () => setRowMenu(null);
    window.setTimeout(() => window.addEventListener("click", close), 0);
    return () => window.removeEventListener("click", close);
  }, [rowMenu]);

  const selectedWorker =
    workers.find((worker) => worker.id === selectedWorkerId) ?? workers[0];
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const selectedPayment =
    payments.find((payment) => payment.id === selectedPaymentId) ?? payments[0];
  const activeWorkers = workers.filter(
    (worker) => worker.status === "active",
  ).length;
  const taskSpend = tasks.reduce((sum, task) => sum + task.estimatedTotal, 0);
  const pendingTotal = payments
    .filter(
      (payment) =>
        payment.status === "Pending" || payment.status === "Scheduled",
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
  const upcomingTasks = tasks.filter(
    (task) =>
      task.status === "Upcoming" ||
      task.status === "Scheduled" ||
      task.status === "Future",
  ).length;
  const attentionTasks = tasks.filter(
    (task) => task.status === "Today" || task.status === "Overdue",
  ).length;

  const kpis = [
    {
      label: "Active workers",
      value: String(activeWorkers),
      note: `${workers.length} in directory · Kiambu`,
    },
    {
      label: "Tasks this season",
      value: String(tasks.length),
      note: `${tasks.filter((task) => task.status === "Completed").length} completed · ${attentionTasks} need attention`,
    },
    {
      label: "Pending payroll",
      value: money(pendingTotal),
      note: `${payments.filter((payment) => payment.status === "Pending").length} ready · ${payments.filter((payment) => payment.status === "Scheduled").length} scheduled`,
    },
    {
      label: "Season labour plan",
      value: money(taskSpend),
      note: `${upcomingTasks} upcoming tasks across four crops`,
    },
  ];

  const openWorker = (id: string) => {
    setSelectedWorkerId(id);
    setDrawer("worker");
    setRowMenu(null);
  };
  const openTask = (id: string) => {
    setSelectedTaskId(id);
    setDrawer("task");
    setRowMenu(null);
  };
  const openPayment = (id: string) => {
    setSelectedPaymentId(id);
    setDrawer("receipt");
    setRowMenu(null);
  };
  const openModal = (next: ModalId) => {
    setModal(next);
    setMenu(false);
    setRowMenu(null);
  };

  const saveWorker = (worker: Worker) => {
    setWorkers((current) =>
      current.some((item) => item.id === worker.id)
        ? current.map((item) => (item.id === worker.id ? worker : item))
        : [...current, worker],
    );
    setSelectedWorkerId(worker.id);
    toast.notify(
      `${worker.name} is ${worker.id} in the worker directory`,
      "success",
    );
  };

  const saveTask = (task: LabourTask) => {
    setTasks((current) =>
      current.some((item) => item.id === task.id)
        ? current.map((item) => (item.id === task.id ? task : item))
        : [...current, task],
    );
    setSelectedTaskId(task.id);
    toast.notify(`${task.title} saved to the task schedule`, "success");
  };

  const completeTask = (task: LabourTask, photoNote: string) => {
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? task : item)),
    );
    const newRows: PayrollPayment[] = task.workerIds
      .filter(
        (workerId) =>
          task.attendance.find((entry) => entry.workerId === workerId)
            ?.status !== "Absent",
      )
      .map((workerId, index) => {
        const worker = workerByIdFromState(workers, workerId);
        return {
          id: `${task.id}-pay-${index + 1}`,
          workerId,
          workerName: worker?.name ?? workerId,
          taskId: task.id,
          task: task.title,
          crop: task.crop,
          amount:
            task.rateType === "Daily rate" ? task.rateAmount : task.rateAmount,
          dueDate: task.date,
          status: "Pending",
          method: task.paymentMethod.includes("Manual")
            ? "Manual"
            : "GrowMO wallet",
          receipt: null,
          scheduledDate: null,
          note: `${photoNote} · attendance confirmed`,
        };
      });
    setPayments((current) => [
      ...current.filter((payment) => payment.taskId !== task.id),
      ...newRows,
    ]);
    setAttendance((current) =>
      current.map((record) => {
        const entry = task.attendance.find(
          (item) => item.workerId === record.workerId,
        );
        return record.taskId === task.id && entry
          ? {
              ...record,
              status: entry.status,
              confirmed: true,
              actualHours: entry.hours,
              quality: task.quality,
              note: entry.note,
            }
          : record;
      }),
    );
    setSelectedTaskId(task.id);
    toast.notify(
      `${task.title} completed — ${newRows.length} payment${newRows.length === 1 ? "" : "s"} prepared`,
      "success",
    );
  };

  const saveAttendance = (records: AttendanceRecord[]) => {
    setAttendance((current) =>
      current.map(
        (record) => records.find((next) => next.id === record.id) ?? record,
      ),
    );
    toast.notify("Attendance confirmations saved to payroll", "success");
  };

  const settlePayments = (ids: string[], receipt: string) => {
    setPayments((current) =>
      current.map((payment) =>
        ids.includes(payment.id)
          ? { ...payment, status: "Paid", receipt, scheduledDate: null }
          : payment,
      ),
    );
    setSelectedPaymentIds([]);
    toast.notify(
      `M-Pesa receipt ${receipt} recorded — payroll updated`,
      "success",
    );
  };

  const addAdvance = (worker: Worker, amount: number, receipt: string) => {
    const payment: PayrollPayment = {
      id: `advance-${receipt}`,
      workerId: worker.id,
      workerName: worker.name,
      taskId: `advance-${receipt}`,
      task: "Worker advance",
      crop: "General farm",
      amount,
      dueDate: FARM_LABOUR_CONTEXT.today,
      status: "Paid",
      method: "M-Pesa advance",
      receipt,
      scheduledDate: null,
      note: "Advance sent from worker detail",
    };
    setPayments((current) => [payment, ...current]);
    toast.notify(
      `Advance sent to ${worker.name.split(" ")[0]} · ${receipt}`,
      "success",
    );
  };

  const exportRecords = (format: "csv" | "print") => {
    if (format === "print") {
      window.print();
      toast.notify("Labour summary opened for printing", "success");
      return;
    }
    const body = [
      "Worker ID,Worker,Phone,Task,Crop,Amount (KES),Due date,Status,Receipt",
      ...payments.map((payment) =>
        [
          payment.workerId,
          payment.workerName,
          payment.task,
          payment.crop,
          payment.amount,
          payment.dueDate,
          payment.status,
          payment.receipt ?? "",
        ].join(","),
      ),
    ].join("\n");
    downloadText("growmo-labour-payroll.csv", `${body}\n`);
    toast.notify("Labour payroll CSV downloaded", "success");
  };

  const sendWorkerUpdate = (audience: string) =>
    toast.notify(`Simulated SMS queued for ${audience}`, "success");

  const tabItems = [
    {
      id: "workers" as const,
      label: "Workers",
      icon: <Users />,
      count: workers.length,
    },
    {
      id: "scheduler" as const,
      label: "Task scheduler",
      icon: <ClipboardList />,
      count: tasks.length,
    },
    { id: "calendar" as const, label: "Calendar", icon: <CalendarDays /> },
    {
      id: "attendance" as const,
      label: "Attendance",
      icon: <ClipboardCheck />,
      count: attendance.filter((record) => record.status === "Pending").length,
    },
    {
      id: "payroll" as const,
      label: "Payroll",
      icon: <WalletCards />,
      count: payments.filter((payment) => payment.status === "Pending").length,
    },
    { id: "forecast" as const, label: "Cost forecast", icon: <BarChart3 /> },
    { id: "benchmarks" as const, label: "County rates", icon: <TrendingUp /> },
  ];

  return (
    <div>
      <Reveal>
        <LabourHeaderCard
          kpis={kpis}
          actions={
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => openModal("worker")}
              >
                <UserPlus /> Add worker
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => openModal("task")}
              >
                <Plus /> Create task
              </button>
              <Link className="gm-btn gm-btn-ghost" to="/app/inventory">
                <HandCoins /> Check inputs
              </Link>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="Labour actions"
                  aria-expanded={menu}
                  onClick={() => setMenu((current) => !current)}
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="gm-menu">
                    <p className="gm-menuhead">Labour actions</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentIds(
                          payments
                            .filter(
                              (payment) =>
                                payment.status === "Pending" ||
                                payment.status === "Scheduled",
                            )
                            .map((payment) => payment.id),
                        );
                        openModal("batch-pay");
                      }}
                    >
                      <WalletCards /> Run M-Pesa payroll
                    </button>
                    <button type="button" onClick={() => openModal("notify")}>
                      <BellRing /> Message workers
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("attendance")}
                    >
                      <ClipboardCheck /> Confirm attendance
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("templates")}
                    >
                      <ListChecks /> Browse task templates
                    </button>
                    <hr />
                    <button type="button" onClick={() => openModal("settings")}>
                      <Settings2 /> Labour settings
                    </button>
                    <button type="button" onClick={() => openModal("export")}>
                      <Download /> Export labour records
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        window.print();
                      }}
                    >
                      <Printer /> Print current view
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />
      </Reveal>

      {menu ? (
        <button
          type="button"
          className="gm-drop-close"
          aria-label="Close labour actions"
          onClick={() => setMenu(false)}
        />
      ) : null}

      <div className="gm-plan-detail-tabs mt-4">
        <PlannerSubtabs
          value={view}
          items={tabItems}
          onChange={setView}
          label="Labour management sections"
        />
      </div>

      {view === "workers" ? (
        <WorkersView
          workers={workers}
          search={workerSearch}
          onSearch={(value) => {
            setWorkerSearch(value);
            setWorkerPage(1);
          }}
          status={workerStatus}
          onStatus={(value) => {
            setWorkerStatus(value);
            setWorkerPage(1);
          }}
          skill={workerSkill}
          onSkill={(value) => {
            setWorkerSkill(value);
            setWorkerPage(1);
          }}
          page={workerPage}
          onPage={setWorkerPage}
          onOpen={openWorker}
          onEdit={(id) => {
            setSelectedWorkerId(id);
            openModal("edit-worker");
          }}
          onAdvance={(id) => {
            setSelectedWorkerId(id);
            openModal("advance");
          }}
          onTask={() => openModal("task")}
          onDeactivate={(id) => {
            setSelectedWorkerId(id);
            openModal("deactivate-worker");
          }}
        />
      ) : null}
      {view === "scheduler" ? (
        <SchedulerView
          tasks={tasks}
          workers={workers}
          search={taskSearch}
          onSearch={(value) => {
            setTaskSearch(value);
            setTaskPage(1);
          }}
          status={taskStatus}
          onStatus={(value) => {
            setTaskStatus(value);
            setTaskPage(1);
          }}
          page={taskPage}
          onPage={setTaskPage}
          onOpen={openTask}
          onCreate={() => openModal("task")}
          onTemplate={() => openModal("templates")}
          onComplete={(id) => {
            setSelectedTaskId(id);
            openModal("complete-task");
          }}
          onEdit={(id) => {
            setSelectedTaskId(id);
            openModal("edit-task");
          }}
          onReschedule={(id) => {
            setSelectedTaskId(id);
            openModal("reschedule-task");
          }}
          onDelete={(id) => {
            setSelectedTaskId(id);
            openModal("delete-task");
          }}
        />
      ) : null}
      {view === "calendar" ? (
        <CalendarView
          tasks={tasks}
          cursor={calendarCursor}
          onCursor={setCalendarCursor}
          onOpenTask={openTask}
          onOpenDay={(day) => {
            setSelectedDay(day);
            setDrawer("day");
          }}
        />
      ) : null}
      {view === "attendance" ? (
        <AttendanceView
          records={attendance}
          query={attendanceQuery}
          onQuery={(value) => {
            setAttendanceQuery(value);
            setAttendancePage(1);
          }}
          status={attendanceStatus}
          onStatus={(value) => {
            setAttendanceStatus(value);
            setAttendancePage(1);
          }}
          page={attendancePage}
          onPage={setAttendancePage}
          onOpenTask={openTask}
          onBulk={() => openModal("attendance")}
          onComplete={(id) => {
            setSelectedTaskId(id);
            openModal("complete-task");
          }}
        />
      ) : null}
      {view === "payroll" ? (
        <PayrollView
          payments={payments}
          selectedIds={selectedPaymentIds}
          query={payrollQuery}
          onQuery={(value) => {
            setPayrollQuery(value);
            setPayrollPage(1);
          }}
          status={payrollStatus}
          onStatus={(value) => {
            setPayrollStatus(value);
            setPayrollPage(1);
          }}
          page={payrollPage}
          onPage={setPayrollPage}
          onSelect={(id) =>
            setSelectedPaymentIds((current) =>
              current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
            )
          }
          onSelectAll={(ids) => setSelectedPaymentIds(ids)}
          onPay={(ids) => {
            setSelectedPaymentIds(ids);
            if (ids.length === 1) setSelectedPaymentId(ids[0]);
            openModal(ids.length > 1 ? "batch-pay" : "pay");
          }}
          onEdit={(id) => {
            setSelectedPaymentId(id);
            openModal("edit-payment");
          }}
          onReceipt={openPayment}
          onOpenWorker={openWorker}
          onActivity={() => setDrawer("activity")}
        />
      ) : null}
      {view === "forecast" ? (
        <ForecastView
          crop={forecastCrop}
          onCrop={setForecastCrop}
          tasks={tasks}
        />
      ) : null}
      {view === "benchmarks" ? (
        <BenchmarksView
          onOpen={(benchmark) => {
            setSelectedBenchmark(benchmark);
            openModal("benchmark");
          }}
        />
      ) : null}

      <PageDrawers
        drawer={drawer}
        worker={selectedWorker}
        task={selectedTask}
        day={selectedDay}
        payment={selectedPayment}
        workers={workers}
        tasks={tasks}
        onClose={() => setDrawer(null)}
        onEditWorker={(id) => {
          setSelectedWorkerId(id);
          setDrawer(null);
          openModal("edit-worker");
        }}
        onAdvance={(id) => {
          setSelectedWorkerId(id);
          setDrawer(null);
          openModal("advance");
        }}
        onCreateTask={() => {
          setDrawer(null);
          openModal("task");
        }}
        onOpenTask={openTask}
        onOpenWorker={openWorker}
      />

      <WorkerWizard
        open={modal === "worker" || modal === "edit-worker"}
        editing={modal === "edit-worker" ? selectedWorker : null}
        onClose={() => setModal(null)}
        onSave={saveWorker}
      />
      <TaskWizard
        open={modal === "task" || modal === "edit-task"}
        editing={modal === "edit-task" ? selectedTask : null}
        initialTemplate={modal === "task" ? selectedTemplate : null}
        workers={workers}
        onClose={() => {
          setModal(null);
          setSelectedTemplate(null);
        }}
        onSave={saveTask}
      />
      <TaskTemplateDialog
        open={modal === "templates"}
        onClose={() => setModal(null)}
        onUse={(template) => {
          setSelectedTemplate(template);
          setModal("task");
        }}
      />
      <TaskCompletionWizard
        open={modal === "complete-task"}
        task={selectedTask}
        workers={workers}
        onClose={() => setModal(null)}
        onComplete={completeTask}
      />
      <AttendanceWizard
        open={modal === "attendance"}
        date={FARM_LABOUR_CONTEXT.today}
        records={attendance.filter(
          (record) =>
            record.date === FARM_LABOUR_CONTEXT.today ||
            record.status === "Pending",
        )}
        onClose={() => setModal(null)}
        onSave={saveAttendance}
      />
      <PaymentWizard
        open={modal === "pay" || modal === "batch-pay"}
        payments={
          modal === "batch-pay"
            ? payments.filter((payment) =>
                selectedPaymentIds.includes(payment.id),
              )
            : selectedPayment
              ? [selectedPayment]
              : []
        }
        onClose={() => setModal(null)}
        onPaid={settlePayments}
      />
      <EditPaymentDialog
        open={modal === "edit-payment"}
        payment={selectedPayment}
        onClose={() => setModal(null)}
        onSave={(payment) => {
          setPayments((current) =>
            current.map((item) => (item.id === payment.id ? payment : item)),
          );
          toast.notify("Payment schedule updated", "success");
        }}
      />
      <AdvanceWizard
        open={modal === "advance"}
        worker={selectedWorker}
        onClose={() => setModal(null)}
        onComplete={addAdvance}
      />
      <SettingsDialog
        open={modal === "settings"}
        settings={settings}
        onClose={() => setModal(null)}
        onSave={(next) => {
          setSettings(next);
          toast.notify("Labour settings saved", "success");
        }}
      />
      <NotifyWorkersDialog
        open={modal === "notify"}
        workers={workers}
        onClose={() => setModal(null)}
        onSend={sendWorkerUpdate}
      />
      <ExportDialog
        open={modal === "export"}
        onClose={() => setModal(null)}
        onExport={exportRecords}
      />
      <BenchmarkDialog
        open={modal === "benchmark"}
        county={selectedBenchmark.county}
        insight={selectedBenchmark.insight}
        onClose={() => setModal(null)}
      />
      <ConfirmDialog
        open={modal === "deactivate-worker"}
        title={`Deactivate ${selectedWorker?.name ?? "worker"}?`}
        desc="The worker will leave active assignment lists, but all past tasks, ratings and payroll records stay available."
        confirmLabel="Deactivate worker"
        danger
        onClose={() => setModal(null)}
        onConfirm={() => {
          if (selectedWorker) {
            setWorkers((current) =>
              current.map((worker) =>
                worker.id === selectedWorker.id
                  ? { ...worker, status: "inactive" }
                  : worker,
              ),
            );
            toast.notify(`${selectedWorker.name} moved to inactive`, "success");
          }
        }}
      />
      <ConfirmDialog
        open={modal === "delete-task"}
        title="Delete this scheduled task?"
        desc="The task card and its future assignment will be removed. Completed payroll records are not deleted by this action."
        confirmLabel="Delete task"
        danger
        onClose={() => setModal(null)}
        onConfirm={() => {
          if (selectedTask) {
            setTasks((current) =>
              current.filter((task) => task.id !== selectedTask.id),
            );
            toast.notify("Scheduled task deleted", "success");
          }
        }}
      />
      <ConfirmDialog
        open={modal === "reschedule-task"}
        title="Reschedule this task?"
        desc="Workers will need a fresh reminder after the date changes."
        confirmLabel="Open task editor"
        onClose={() => setModal(null)}
        onConfirm={() => setModal("edit-task")}
      />
    </div>
  );
}

function workerByIdFromState(workers: Worker[], id: string) {
  return workers.find((worker) => worker.id === id);
}

/* ========================================================================== */
/* 6.1 Worker directory                                                       */
/* ========================================================================== */
function WorkersView({
  workers,
  search,
  onSearch,
  status,
  onStatus,
  skill,
  onSkill,
  page,
  onPage,
  onOpen,
  onEdit,
  onAdvance,
  onTask,
  onDeactivate,
}: {
  workers: Worker[];
  search: string;
  onSearch: (value: string) => void;
  status: WorkerStatus | "all";
  onStatus: (value: WorkerStatus | "all") => void;
  skill: string;
  onSkill: (value: string) => void;
  page: number;
  onPage: (page: number) => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onAdvance: (id: string) => void;
  onTask: () => void;
  onDeactivate: (id: string) => void;
}) {
  const filtered = useMemo(
    () =>
      workers.filter((worker) => {
        const haystack =
          `${worker.name} ${worker.id} ${worker.phone} ${worker.mpesaName} ${worker.village} ${worker.nationalId}`.toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (status === "all" || worker.status === status) &&
          (skill === "All skills" || worker.skills.includes(skill))
        );
      }),
    [workers, search, status, skill],
  );
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const totalEarned = workers.reduce(
    (sum, worker) => sum + worker.totalEarned,
    0,
  );

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.1 · Worker directory"
        title="A trusted team, with the rate card in plain sight"
        subtitle="Search the people behind the work. Each record carries a Kenyan phone, M-Pesa name, ID, village, skills, agreed rate, rating and seasonal earnings."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onTask}>
            <Plus /> Assign a task
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={Users}
          label="Directory"
          value={String(workers.length)}
          note="worker records"
        />
        <DashboardMetric
          icon={ShieldCheck}
          label="Active"
          value={String(
            workers.filter((worker) => worker.status === "active").length,
          )}
          note="ready for assignment"
        />
        <DashboardMetric
          icon={Star}
          label="Average rating"
          value={`${(workers.filter((worker) => worker.rating > 0).reduce((sum, worker) => sum + worker.rating, 0) / workers.filter((worker) => worker.rating > 0).length).toFixed(1)} / 5`}
          note="from completed tasks"
        />
        <DashboardMetric
          icon={HandCoins}
          label="Season earnings"
          value={money(totalEarned)}
          note="paid and recorded"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-plan-toolbar">
          <div className="gm-field">
            <label htmlFor="worker-search">Search workers</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="worker-search"
                className="gm-input"
                value={search}
                placeholder="Name, worker ID, phone or village"
                onChange={(event) => onSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="worker-status">Status</label>
            <select
              id="worker-status"
              className="gm-select"
              value={status}
              onChange={(event) =>
                onStatus(event.target.value as WorkerStatus | "all")
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on-leave">On leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="gm-field">
            <label htmlFor="worker-skill">Skill</label>
            <select
              id="worker-skill"
              className="gm-select"
              value={skill}
              onChange={(event) => onSkill(event.target.value)}
            >
              <option>All skills</option>
              {WORKER_SKILLS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-end">
            <button type="button" className="gm-filter-chip on">
              <Filter /> {filtered.length} matching
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => {
                onSearch("");
                onStatus("all");
                onSkill("All skills");
              }}
            >
              <RefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Contact & village</th>
              <th>Skills</th>
              <th>Rate card</th>
              <th>Rating / tasks</th>
              <th>Season earnings</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((worker) => (
              <tr key={worker.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link d-flex align-items-center gap-2"
                    onClick={() => onOpen(worker.id)}
                  >
                    <span className="gm-avatar">{worker.initials}</span>
                    <span className="text-start">
                      <strong>{worker.name}</strong>
                      <small className="d-block text-muted">
                        {worker.id} · ID {worker.nationalId}
                      </small>
                    </span>
                  </button>
                </td>
                <td>
                  <a href={phoneHref(worker.phone)} className="gm-table-link">
                    <Phone /> {worker.phone}
                  </a>
                  <small className="d-block text-muted">
                    {worker.mpesaName} · {worker.village}
                  </small>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {worker.skills.slice(0, 3).map((item) => (
                      <span className="gm-chip" key={item}>
                        {item}
                      </span>
                    ))}
                    {worker.skills.length > 3 ? (
                      <span className="gm-chip">
                        +{worker.skills.length - 3}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <strong className="font-display">
                    {money(worker.dailyRate)}
                  </strong>
                  <small className="d-block text-muted">
                    {worker.frequency} ·{" "}
                    {worker.pieceRates[0]
                      ? `${money(worker.pieceRates[0].amount)}/${worker.pieceRates[0].unit}`
                      : "piece rate on request"}
                  </small>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <Stars rating={worker.rating} size={13} />
                    <strong>
                      {worker.rating ? worker.rating.toFixed(1) : "New"}
                    </strong>
                  </div>
                  <small className="text-muted">
                    {worker.tasksCompleted} completed
                  </small>
                </td>
                <td>
                  <strong className="font-display">
                    {money(worker.totalEarned)}
                  </strong>
                  <small className="d-block text-muted">2026 short rains</small>
                </td>
                <td>
                  <StatusChip
                    label={statusLabel(worker.status)}
                    tone={toneForWorker(worker.status)}
                  />
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${worker.name}`}
                      onClick={() => onOpen(worker.id)}
                    >
                      <Eye />
                    </button>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Edit ${worker.name}`}
                      onClick={() => onEdit(worker.id)}
                    >
                      <Pencil />
                    </button>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Pay advance to ${worker.name}`}
                      onClick={() => onAdvance(worker.id)}
                    >
                      <HandCoins />
                    </button>
                    {worker.status === "active" ? (
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Deactivate ${worker.name}`}
                        onClick={() => onDeactivate(worker.id)}
                      >
                        <Trash2 />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={8}>
                  <div className="gm-plan-empty">
                    <Search />
                    <strong>No workers match this search</strong>
                    <small>Try a phone number, village or skill.</small>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        <small className="text-muted">
          Showing {rows.length} of {filtered.length} workers · every record
          remains searchable for payroll history.
        </small>
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-lg-7">
          <LabourInsight
            eyebrow="GrowMO labour note"
            title="Your best retention lever is predictable pay"
            body="Lucy, Grace and John are your highest-rated workers. Keep the weekly M-Pesa rhythm, show the quality score on completion, and offer them first choice on the January cabbage harvest."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={onTask}
              >
                <CalendarClock /> Plan the next shift
              </button>
            }
          />
        </div>
        <div className="col-lg-5">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Directory legend</span>
            <div className="gm-check-row mt-2">
              <ShieldCheck />
              <span>
                <strong>Active</strong>
                <small>Eligible for new assignments and reminders.</small>
              </span>
            </div>
            <div className="gm-check-row">
              <Clock3 />
              <span>
                <strong>On leave</strong>
                <small>Keep records, but flag before scheduling.</small>
              </span>
            </div>
            <div className="gm-check-row">
              <FileText />
              <span>
                <strong>Inactive</strong>
                <small>Historical payroll only until reactivated.</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* 6.2 Task scheduler                                                         */
/* ========================================================================== */
function SchedulerView({
  tasks,
  workers,
  search,
  onSearch,
  status,
  onStatus,
  page,
  onPage,
  onOpen,
  onCreate,
  onTemplate,
  onComplete,
  onEdit,
  onReschedule,
  onDelete,
}: {
  tasks: LabourTask[];
  workers: Worker[];
  search: string;
  onSearch: (value: string) => void;
  status: TaskStatus | "all";
  onStatus: (value: TaskStatus | "all") => void;
  page: number;
  onPage: (page: number) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onTemplate: () => void;
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onReschedule: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const haystack =
          `${task.title} ${task.type} ${task.crop} ${task.plot} ${task.date}`.toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (status === "all" || task.status === status)
        );
      }),
    [tasks, search, status],
  );
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const assignedNames = (task: LabourTask) =>
    task.workerIds
      .map(
        (id) =>
          workers.find((worker) => worker.id === id)?.name.split(" ")[0] ?? id,
      )
      .join(", ");

  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.2 · Task scheduler"
        title="Create work once, then let the card carry the detail"
        subtitle="Templates, worker assignment, rate type, calculated budget, payment timing, instructions and tools all travel with the task."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={onTemplate}
            >
              <ListChecks /> Use template
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onCreate}
            >
              <Plus /> Create task
            </button>
          </div>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="gm-plan-toolbar">
          <div className="gm-field">
            <label htmlFor="task-search">Find a task</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="task-search"
                className="gm-input"
                value={search}
                placeholder="Task, crop, plot or date"
                onChange={(event) => onSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="gm-select"
              value={status}
              onChange={(event) =>
                onStatus(event.target.value as TaskStatus | "all")
              }
            >
              <option value="all">All task states</option>
              {[
                "Today",
                "Overdue",
                "Upcoming",
                "Scheduled",
                "Future",
                "Completed",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="gm-field">
            <span className="gm-field-label">Fast filters</span>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className={`gm-filter-chip ${status === "Today" ? "on" : ""}`}
                onClick={() => onStatus(status === "Today" ? "all" : "Today")}
              >
                Today
              </button>
              <button
                type="button"
                className={`gm-filter-chip ${status === "Overdue" ? "on" : ""}`}
                onClick={() =>
                  onStatus(status === "Overdue" ? "all" : "Overdue")
                }
              >
                Overdue
              </button>
            </div>
          </div>
          <div className="d-flex align-items-end">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => {
                onSearch("");
                onStatus("all");
              }}
            >
              <RefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Task & crop</th>
              <th>When / where</th>
              <th>Assigned team</th>
              <th>Rate & budget</th>
              <th>Pay timing</th>
              <th>State</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr key={task.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link text-start"
                    onClick={() => onOpen(task.id)}
                  >
                    <strong>{task.title}</strong>
                    <small className="d-block text-muted">
                      {task.type} · {task.crop}
                    </small>
                  </button>
                </td>
                <td>
                  <LabourTimeLine>
                    {task.date} · {task.startTime}
                  </LabourTimeLine>
                  <LabourLocationLine>{task.plot}</LabourLocationLine>
                </td>
                <td>
                  <LabourWorkerLine>{assignedNames(task)}</LabourWorkerLine>
                  <small className="d-block text-muted">
                    {task.workerIds.length} worker
                    {task.workerIds.length === 1 ? "" : "s"}
                  </small>
                </td>
                <td>
                  <strong className="font-display">
                    {money(task.estimatedTotal)}
                  </strong>
                  <small className="d-block text-muted">
                    {task.rateType} · {money(task.rateAmount)}
                  </small>
                </td>
                <td>
                  <small>{task.paymentTiming}</small>
                  <small className="d-block text-muted">
                    {task.paymentMethod}
                  </small>
                </td>
                <td>
                  <LabourStatusPill status={task.status} />
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${task.title}`}
                      onClick={() => onOpen(task.id)}
                    >
                      <Eye />
                    </button>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Edit ${task.title}`}
                      onClick={() => onEdit(task.id)}
                    >
                      <Pencil />
                    </button>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Reschedule ${task.title}`}
                      onClick={() => onReschedule(task.id)}
                    >
                      <CalendarClock />
                    </button>
                    {task.status !== "Completed" ? (
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Complete ${task.title}`}
                        onClick={() => onComplete(task.id)}
                      >
                        <Check />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={7}>
                  <div className="gm-plan-empty">
                    <ListChecks />
                    <strong>No tasks match the filters</strong>
                    <small>
                      Create a task from a template or clear the search.
                    </small>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        <small className="text-muted">
          {filtered.length} task cards · estimated plan total{" "}
          {money(filtered.reduce((sum, task) => sum + task.estimatedTotal, 0))}
        </small>
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-lg-4">
          <LabourBudgetBar
            label="Today and overdue"
            value={tasks
              .filter(
                (task) => task.status === "Today" || task.status === "Overdue",
              )
              .reduce((sum, task) => sum + task.estimatedTotal, 0)}
            total={tasks.reduce((sum, task) => sum + task.estimatedTotal, 0)}
            note="Prioritise attendance before releasing pay."
          />
        </div>
        <div className="col-lg-4">
          <LabourBudgetBar
            label="Upcoming work"
            value={tasks
              .filter(
                (task) =>
                  task.status === "Upcoming" || task.status === "Scheduled",
              )
              .reduce((sum, task) => sum + task.estimatedTotal, 0)}
            total={tasks.reduce((sum, task) => sum + task.estimatedTotal, 0)}
            note="Rate card includes worker count and duration."
          />
        </div>
        <div className="col-lg-4">
          <LabourInsight
            eyebrow="Scheduler guardrail"
            title="A complete job card prevents rate disputes"
            body="Every task carries the exact crop, plot, instructions, tools and payment timing. Workers see the same commitment Mary sees."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={onTemplate}
              >
                <FileText /> Review templates
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* 6.3 Labour calendar                                                        */
/* ========================================================================== */
function CalendarView({
  tasks,
  cursor,
  onCursor,
  onOpenTask,
  onOpenDay,
}: {
  tasks: LabourTask[];
  cursor: Date;
  onCursor: (date: Date) => void;
  onOpenTask: (id: string) => void;
  onOpenDay: (day: CalendarDay) => void;
}) {
  const days = calendarDays(cursor, tasks);
  const monthTasks = tasks.filter(
    (task) =>
      taskDateKey(task.date).slice(0, 7) === monthDateKey(cursor).slice(0, 7),
  );
  const completed = monthTasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const upcoming = monthTasks.filter(
    (task) =>
      task.status === "Upcoming" ||
      task.status === "Scheduled" ||
      task.status === "Future",
  ).length;
  const overdue = monthTasks.filter((task) => task.status === "Overdue").length;
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.3 · Labour calendar view"
        title="See the labour rhythm before the week gets busy"
        subtitle="Completed, today, overdue and upcoming work stay in one monthly view. Click a date for its crew, budget and instructions; click a task for the full job card."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => onOpenTask("task-003")}
          >
            <CalendarClock /> Open a task
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={CheckCircle2}
          label="Completed this month"
          value={String(completed)}
          note="attendance can be reviewed"
        />
        <DashboardMetric
          icon={Clock3}
          label="Upcoming"
          value={String(upcoming)}
          note="workers to remind"
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Overdue"
          value={String(overdue)}
          note="needs a field decision"
        />
        <DashboardMetric
          icon={CalendarDays}
          label="Month tasks"
          value={String(monthTasks.length)}
          note="across active crops"
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-9">
          <LabourCalendar
            days={days}
            monthLabel={monthLabel(cursor)}
            onPrevious={() =>
              onCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            onNext={() =>
              onCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            onToday={() => onCursor(new Date(2026, 10, 1))}
            onOpenDay={onOpenDay}
          />
        </div>
        <div className="col-xl-3">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Calendar guide</span>
            <div className="gm-check-row mt-2">
              <span className="gm-calendar-dot completed" />
              <span>
                <strong>Completed</strong>
                <small>Attendance and quality captured.</small>
              </span>
            </div>
            <div className="gm-check-row">
              <span className="gm-calendar-dot today" />
              <span>
                <strong>Today</strong>
                <small>Open the field card and confirm people.</small>
              </span>
            </div>
            <div className="gm-check-row">
              <span className="gm-calendar-dot overdue" />
              <span>
                <strong>Overdue</strong>
                <small>Reschedule or mark it complete.</small>
              </span>
            </div>
            <div className="gm-check-row">
              <span className="gm-calendar-dot upcoming" />
              <span>
                <strong>Upcoming</strong>
                <small>Send the reminder before 18:00.</small>
              </span>
            </div>
            <hr />
            <LabourInsight
              eyebrow="Calendar habit"
              title="Plan the crew, not just the crop"
              body="A full-day cabbage harvest uses six people, crates and a buyer deadline. Keep those details in the same task so the calendar becomes a real operating plan."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* 6.4 Attendance & completion                                               */
/* ========================================================================== */
function AttendanceView({
  records,
  query,
  onQuery,
  status,
  onStatus,
  page,
  onPage,
  onOpenTask,
  onBulk,
  onComplete,
}: {
  records: AttendanceRecord[];
  query: string;
  onQuery: (value: string) => void;
  status: AttendanceStatus | "all";
  onStatus: (value: AttendanceStatus | "all") => void;
  page: number;
  onPage: (page: number) => void;
  onOpenTask: (id: string) => void;
  onBulk: () => void;
  onComplete: (id: string) => void;
}) {
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const haystack =
          `${record.workerName} ${record.taskTitle} ${record.crop} ${record.date} ${record.workerId}`.toLowerCase();
        return (
          (!query || haystack.includes(query.toLowerCase())) &&
          (status === "all" || record.status === status)
        );
      }),
    [records, query, status],
  );
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const pending = records.filter(
    (record) => record.status === "Pending",
  ).length;
  const present = records.filter(
    (record) => record.status === "Present" || record.status === "Late",
  ).length;
  const totalHours = records.reduce(
    (sum, record) => sum + record.actualHours,
    0,
  );
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.4 · Attendance & completion"
        title="Pay for work that was actually confirmed"
        subtitle="Mark present or absent, record actual hours, score quality and attach a note or photo before the completion flow prepares payroll."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onBulk}>
            <ClipboardCheck /> Confirm attendance
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={CheckCircle2}
          label="Present / late"
          value={String(present)}
          note="confirmed worker shifts"
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Needs confirmation"
          value={String(pending)}
          note="attendance records"
        />
        <DashboardMetric
          icon={Clock3}
          label="Actual hours"
          value={`${totalHours}`}
          note="logged in current records"
        />
        <DashboardMetric
          icon={Sparkles}
          label="Auto-pay rule"
          value="ON"
          note="after quality review"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-plan-toolbar">
          <div className="gm-field">
            <label htmlFor="attendance-search">Search attendance</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="attendance-search"
                className="gm-input"
                value={query}
                placeholder="Worker, task, crop or date"
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="attendance-status">Status</label>
            <select
              id="attendance-status"
              className="gm-select"
              value={status}
              onChange={(event) =>
                onStatus(event.target.value as AttendanceStatus | "all")
              }
            >
              <option value="all">All statuses</option>
              <option>Present</option>
              <option>Late</option>
              <option>Absent</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="gm-field">
            <span className="gm-field-label">Shortcuts</span>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className={`gm-filter-chip ${status === "Pending" ? "on" : ""}`}
                onClick={() =>
                  onStatus(status === "Pending" ? "all" : "Pending")
                }
              >
                Pending
              </button>
              <button type="button" className="gm-filter-chip" onClick={onBulk}>
                Bulk mark
              </button>
            </div>
          </div>
          <div className="d-flex align-items-end">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => {
                onQuery("");
                onStatus("all");
              }}
            >
              <RefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Task / crop</th>
              <th>Date</th>
              <th>Attendance</th>
              <th>Actual hours</th>
              <th>Quality</th>
              <th>Note</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <tr key={record.id}>
                <td>
                  <strong>{record.workerName}</strong>
                  <small className="d-block text-muted">
                    {record.workerId}
                  </small>
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-table-link text-start"
                    onClick={() => onOpenTask(record.taskId)}
                  >
                    <strong>{record.taskTitle}</strong>
                    <small className="d-block text-muted">{record.crop}</small>
                  </button>
                </td>
                <td>{record.date}</td>
                <td>
                  <StatusChip
                    label={record.status}
                    tone={attendanceTone(record.status)}
                  />
                </td>
                <td>
                  <strong>{record.actualHours || "—"}</strong>
                  {record.actualHours ? " hrs" : ""}
                </td>
                <td>{record.quality ? `${record.quality} / 5` : "Pending"}</td>
                <td>
                  <small>{record.note || "No note yet"}</small>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Open ${record.taskTitle}`}
                      onClick={() => onOpenTask(record.taskId)}
                    >
                      <Eye />
                    </button>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Complete ${record.taskTitle}`}
                      onClick={() => onComplete(record.taskId)}
                    >
                      <Check />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={8}>
                  <div className="gm-plan-empty">
                    <ClipboardCheck />
                    <strong>No attendance records match</strong>
                    <small>Try Pending or clear the search.</small>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        <small className="text-muted">
          Attendance is the approval gate — no blind M-Pesa release.
        </small>
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-lg-7">
          <div className="gm-card p-3 h-100">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <span className="gm-eyebrow">Completion checklist</span>
                <h3 className="font-display mb-1">
                  A task becomes payroll-ready in four checks
                </h3>
              </div>
              <StatusChip label="4 steps" tone="low" />
            </div>
            <div className="row g-2 mt-2">
              <div className="col-sm-6">
                <div className="gm-check-row">
                  <CheckCircle2 />
                  <span>
                    <strong>Attendance</strong>
                    <small>Present, absent or late per person.</small>
                  </span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="gm-check-row">
                  <Clock3 />
                  <span>
                    <strong>Actual hours</strong>
                    <small>Useful for half-day and piece work.</small>
                  </span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="gm-check-row">
                  <Sparkles />
                  <span>
                    <strong>Quality score</strong>
                    <small>One to five, with a field note.</small>
                  </span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="gm-check-row">
                  <Smartphone />
                  <span>
                    <strong>Auto-pay simulation</strong>
                    <small>Creates pending payment rows.</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <LabourInsight
            eyebrow="Kiswahili field cue"
            title="Umefika? Thibitisha kwanza"
            body="Confirm who arrived before you mark the task complete. A clear record protects Mary and the worker when the M-Pesa receipt is reviewed later."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={onBulk}
              >
                <ClipboardCheck /> Open confirmation wizard
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* 6.5 Payroll dashboard                                                      */
/* ========================================================================== */
function PayrollView({
  payments,
  selectedIds,
  query,
  onQuery,
  status,
  onStatus,
  page,
  onPage,
  onSelect,
  onSelectAll,
  onPay,
  onEdit,
  onReceipt,
  onOpenWorker,
  onActivity,
}: {
  payments: PayrollPayment[];
  selectedIds: string[];
  query: string;
  onQuery: (value: string) => void;
  status: PaymentStatus | "all";
  onStatus: (value: PaymentStatus | "all") => void;
  page: number;
  onPage: (page: number) => void;
  onSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onPay: (ids: string[]) => void;
  onEdit: (id: string) => void;
  onReceipt: (id: string) => void;
  onOpenWorker: (id: string) => void;
  onActivity: () => void;
}) {
  const filtered = useMemo(
    () =>
      payments.filter((payment) => {
        const haystack =
          `${payment.workerName} ${payment.workerId} ${payment.task} ${payment.crop} ${payment.dueDate} ${payment.receipt ?? ""}`.toLowerCase();
        return (
          (!query || haystack.includes(query.toLowerCase())) &&
          (status === "all" || payment.status === status)
        );
      }),
    [payments, query, status],
  );
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const pending = payments.filter((payment) => payment.status === "Pending");
  const scheduled = payments.filter(
    (payment) => payment.status === "Scheduled",
  );
  const future = payments.filter((payment) => payment.status === "Future");
  const paid = payments.filter((payment) => payment.status === "Paid");
  const currentIds = rows
    .filter((payment) => payment.status !== "Paid")
    .map((payment) => payment.id);
  const allCurrentSelected =
    currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
  const selectedTotal = payments
    .filter((payment) => selectedIds.includes(payment.id))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const chartRows = [
    { label: "Oct", value: 6200, note: "paid" },
    { label: "Nov", value: 8750, note: "paid", highlight: true },
    { label: "Dec", value: 10100, note: "plan" },
    { label: "Jan", value: 14800, note: "harvest" },
    { label: "Feb", value: 7600, note: "plan" },
    { label: "Mar", value: 9200, note: "maize" },
  ];
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.5 · Payroll dashboard"
        title="Every shilling has a worker, task and receipt"
        subtitle="Review pending work, scheduled and future payments, then pay one worker or a selected batch through the simulated OTP + PIN M-Pesa flow."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={onActivity}
            >
              <Activity /> Activity
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={!selectedIds.length}
              onClick={() => onPay(selectedIds)}
            >
              <WalletCards /> Pay selected ({selectedIds.length})
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={HandCoins}
          label="Paid this season"
          value={money(paid.reduce((sum, payment) => sum + payment.amount, 0))}
          note={`${paid.length} settled records`}
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Pending now"
          value={money(
            pending.reduce((sum, payment) => sum + payment.amount, 0),
          )}
          note={`${pending.length} require review`}
        />
        <DashboardMetric
          icon={CalendarClock}
          label="Scheduled"
          value={money(
            scheduled.reduce((sum, payment) => sum + payment.amount, 0),
          )}
          note={`${scheduled.length} dated payments`}
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Future plan"
          value={money(
            future.reduce((sum, payment) => sum + payment.amount, 0),
          )}
          note={`${future.length} harvest commitments`}
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-8">
          <div className="gm-card p-3 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
              <div>
                <span className="gm-eyebrow">Season payroll curve</span>
                <h3 className="font-display mb-1">
                  Plan cash before harvest day
                </h3>
                <p className="text-muted mb-0">
                  KES across paid history and future task commitments.
                </p>
              </div>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={onActivity}
              >
                <FileText /> View receipts
              </button>
            </div>
            <div className="mt-3">
              <PayrollBarChart rows={chartRows} />
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Wallet control</span>
            <strong
              className="font-display d-block mt-1"
              style={{ fontSize: "1.7rem" }}
            >
              {money(FARM_LABOUR_CONTEXT.walletBalance)}
            </strong>
            <small className="text-muted">GrowMO wallet available</small>
            <div className="gm-check-row mt-3">
              <ShieldCheck />
              <span>
                <strong>Receipt-first payments</strong>
                <small>
                  Every settlement writes a reference into the worker ledger.
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <Smartphone />
              <span>
                <strong>OTP + PIN required</strong>
                <small>
                  No one can release the batch from a table row alone.
                </small>
              </span>
            </div>
            <Link
              className="gm-btn gm-btn-soft gm-btn-sm mt-2"
              to="/app/dashboard"
            >
              <BarChart3 /> Open finance when ready
            </Link>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="gm-plan-toolbar">
          <div className="gm-field">
            <label htmlFor="payroll-search">Search payroll</label>
            <div className="gm-search-field">
              <Search />
              <input
                id="payroll-search"
                className="gm-input"
                value={query}
                placeholder="Worker, task, crop or receipt"
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="gm-field">
            <label htmlFor="payroll-status">Payment state</label>
            <select
              id="payroll-status"
              className="gm-select"
              value={status}
              onChange={(event) =>
                onStatus(event.target.value as PaymentStatus | "all")
              }
            >
              <option value="all">All payments</option>
              <option>Pending</option>
              <option>Scheduled</option>
              <option>Future</option>
              <option>Paid</option>
            </select>
          </div>
          <div className="gm-field">
            <span className="gm-field-label">Batch</span>
            <button
              type="button"
              className="gm-filter-chip"
              onClick={() => onSelectAll(allCurrentSelected ? [] : currentIds)}
            >
              <Check />{" "}
              {allCurrentSelected ? "Clear page" : "Select unpaid page"}
            </button>
          </div>
          <div className="d-flex align-items-end">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => {
                onQuery("");
                onStatus("all");
              }}
            >
              <RefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>
                <span className="visually-hidden">Select</span>
              </th>
              <th>Worker / task</th>
              <th>Crop</th>
              <th>Amount</th>
              <th>Due / scheduled</th>
              <th>Method</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((payment) => (
              <tr key={payment.id}>
                <td>
                  {payment.status === "Paid" ? (
                    <CheckCircle2 className="text-success" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(payment.id)}
                      onChange={() => onSelect(payment.id)}
                      aria-label={`Select ${payment.workerName}`}
                    />
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-table-link text-start"
                    onClick={() => onOpenWorker(payment.workerId)}
                  >
                    <strong>{payment.workerName}</strong>
                    <small className="d-block text-muted">
                      {payment.workerId} · {payment.task}
                    </small>
                  </button>
                </td>
                <td>{payment.crop}</td>
                <td>
                  <strong className="font-display">
                    {money(payment.amount)}
                  </strong>
                </td>
                <td>
                  {payment.scheduledDate ?? payment.dueDate}
                  <small className="d-block text-muted">{payment.note}</small>
                </td>
                <td>
                  <small>{payment.method}</small>
                </td>
                <td>
                  <StatusChip
                    label={payment.status}
                    tone={paymentStatusTone(payment.status)}
                  />
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {payment.status !== "Paid" ? (
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Pay ${payment.workerName}`}
                        onClick={() => onPay([payment.id])}
                      >
                        <WalletCards />
                      </button>
                    ) : null}
                    {payment.status !== "Paid" ? (
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Edit payment for ${payment.workerName}`}
                        onClick={() => onEdit(payment.id)}
                      >
                        <Pencil />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View receipt for ${payment.workerName}`}
                        onClick={() => onReceipt(payment.id)}
                      >
                        <FileText />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={8}>
                  <div className="gm-plan-empty">
                    <WalletCards />
                    <strong>No payments match</strong>
                    <small>Try Pending or clear the search.</small>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        <small className="text-muted">
          {selectedIds.length} selected · {money(selectedTotal)} · paid records
          remain read-only but downloadable.
        </small>
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={onPage}
          perPage={perPage}
          totalItems={filtered.length}
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-lg-4">
          <LabourQuickMetric
            icon={<HandCoins />}
            value={money(
              paid.reduce((sum, payment) => sum + payment.amount, 0),
            )}
            label="settled with receipts"
          />
        </div>
        <div className="col-lg-4">
          <LabourQuickMetric
            icon={<CalendarClock />}
            value={money(
              scheduled.reduce((sum, payment) => sum + payment.amount, 0),
            )}
            label="scheduled for a date"
            tone="amber"
          />
        </div>
        <div className="col-lg-4">
          <LabourQuickMetric
            icon={<ArrowDown />}
            value={money(
              future.reduce((sum, payment) => sum + payment.amount, 0),
            )}
            label="future harvest exposure"
            tone="sky"
          />
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* 6.6 Labour cost forecast                                                   */
/* ========================================================================== */
function ForecastView({
  crop,
  onCrop,
  tasks,
}: {
  crop: string;
  onCrop: (crop: string) => void;
  tasks: LabourTask[];
}) {
  const rows = LABOUR_FORECAST.filter((row) => row.crop === crop);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const done = rows
    .filter((row) => row.status === "Done")
    .reduce((sum, row) => sum + row.total, 0);
  const planned = rows
    .filter((row) => row.status === "Planned")
    .reduce((sum, row) => sum + row.total, 0);
  const cropCosts = Array.from(new Set(tasks.map((task) => task.crop))).map(
    (cropName) => ({
      crop: cropName,
      total: tasks
        .filter((task) => task.crop === cropName)
        .reduce((sum, task) => sum + task.estimatedTotal, 0),
      tasks: tasks.filter((task) => task.crop === cropName).length,
    }),
  );
  const chartRows = rows
    .filter((row) => row.total > 0)
    .slice(0, 7)
    .map((row) => ({
      label: row.task.replace("Cabbage ", "").slice(0, 11),
      value: row.total,
      note: row.when,
      highlight: row.status === "Planned",
    }));
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.6 · Labour cost forecast"
        title="Know the full-season cost before the crop asks for it"
        subtitle="A 0.5-acre cabbage forecast combines completed, planned and self-managed work so labour does not disappear into a last-minute cash request."
        action={
          <div className="gm-field mb-0" style={{ minWidth: 190 }}>
            <label htmlFor="forecast-crop">Forecast crop</label>
            <select
              id="forecast-crop"
              className="gm-select"
              value={crop}
              onChange={(event) => onCrop(event.target.value)}
            >
              <option>Cabbage</option>
              <option>Maize</option>
              <option>Tomato</option>
            </select>
          </div>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={HandCoins}
          label="Full-season labour"
          value={money(total)}
          note="0.5 acre cabbage"
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Paid / completed"
          value={money(done)}
          note="already in the records"
        />
        <DashboardMetric
          icon={CalendarClock}
          label="Still planned"
          value={money(planned)}
          note="future cash exposure"
        />
        <DashboardMetric
          icon={Sparkles}
          label="Self-managed"
          value="KES 0"
          note="30 nursery watering days"
        />
      </div>
      <div className="row g-3 mt-2">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <span className="gm-eyebrow">Task cost observations</span>
                <h3 className="font-display mb-1">Where the forecast goes</h3>
                <p className="text-muted mb-0">
                  The biggest cash moments are transplanting and harvest.
                </p>
              </div>
              <StatusChip label="13 rows" tone="low" />
            </div>
            <div className="mt-3">
              <PayrollBarChart rows={chartRows} />
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Crop observations</span>
            <h3 className="font-display mb-1">Labour by enterprise</h3>
            {cropCosts.map((item) => (
              <div className="gm-check-row" key={item.crop}>
                <span style={{ flex: 1 }}>
                  <strong>{item.crop}</strong>
                  <small>{item.tasks} task cards in the live plan</small>
                </span>
                <strong className="font-display">{money(item.total)}</strong>
              </div>
            ))}
            <div className="gm-plan-rec mt-3">
              <strong>Planning note</strong>
              <p className="mb-0 mt-1" style={{ fontSize: "0.82rem" }}>
                Keep at least {money(Math.round(planned * 0.35))} liquid for the
                next two labour windows. The forecast is a plan, not a release
                instruction.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div>
            <span className="gm-eyebrow">
              Cabbage · 0.5 acre · 2026 short rains
            </span>
            <h3 className="font-display mb-1">Full task-by-task forecast</h3>
            <p className="text-muted mb-0">
              Rates are KES per worker-day unless the row says self-managed.
            </p>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={() => window.print()}
          >
            <Printer /> Print forecast
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Task</th>
                <th>Plot</th>
                <th>Workers</th>
                <th>Days</th>
                <th>Rate / day</th>
                <th>Total</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.when}</td>
                  <td>
                    <strong>{row.task}</strong>
                    <small className="d-block text-muted">{row.crop}</small>
                  </td>
                  <td>{row.plot}</td>
                  <td>{row.workers}</td>
                  <td>{row.days}</td>
                  <td>{row.ratePerDay ? money(row.ratePerDay) : "—"}</td>
                  <td>
                    <strong className="font-display">{money(row.total)}</strong>
                  </td>
                  <td>
                    <StatusChip
                      label={row.status}
                      tone={
                        row.status === "Done"
                          ? "low"
                          : row.status === "Planned"
                            ? "medium"
                            : "neutral"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={6} className="text-end">
                  Full-season labour
                </th>
                <th className="font-display">{money(total)}</th>
                <th />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <LabourInsight
        eyebrow="AI cost observation"
        title="Harvest is your largest single labour event"
        body={`The ${money(rows.find((row) => row.task === "Harvest")?.total ?? 0)} cabbage harvest line is ${Math.round(((rows.find((row) => row.task === "Harvest")?.total ?? 0) / Math.max(total, 1)) * 100)}% of the full-season labour plan. Book Lucy as team lead now, then confirm the six-person crew after the buyer order is signed.`}
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={() => window.print()}
          >
            <FileText /> Save this observation
          </button>
        }
      />
    </section>
  );
}

/* ========================================================================== */
/* 6.7 County labour rate benchmarks                                          */
/* ========================================================================== */
function BenchmarksView({
  onOpen,
}: {
  onOpen: (benchmark: LabourBenchmark) => void;
}) {
  const [selectedCounty, setSelectedCounty] = useState("Kiambu");
  const selected =
    LABOUR_BENCHMARKS.find(
      (benchmark) => benchmark.county === selectedCounty,
    ) ?? LABOUR_BENCHMARKS[0];
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="6.7 · County labour rate benchmarks"
        title="Compare a fair day rate with the counties around you"
        subtitle="Use Kenyan planning ranges to understand the offer — then add skills, transport, timing and quality to the actual task card."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => onOpen(selected)}
          >
            <Sparkles /> Explain my county
          </button>
        }
      />
      <div className="row g-3 mt-2">
        <div className="col-xl-8">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>County</th>
                  <th>Weeding / day</th>
                  <th>Planting / day</th>
                  <th>Harvesting / day</th>
                  <th>Spraying / day</th>
                  <th>Ploughing / acre</th>
                  <th aria-label="Action" />
                </tr>
              </thead>
              <tbody>
                {LABOUR_BENCHMARKS.map((benchmark) => (
                  <tr
                    key={benchmark.county}
                    className={
                      selectedCounty === benchmark.county ? "is-selected" : ""
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className="gm-table-link text-start"
                        onClick={() => setSelectedCounty(benchmark.county)}
                      >
                        <strong>{benchmark.county}</strong>
                        <small className="d-block text-muted">
                          {benchmark.county === "Kiambu"
                            ? "Your farm"
                            : "Kenya planning range"}
                        </small>
                      </button>
                    </td>
                    <td>{benchmark.weeding}</td>
                    <td>{benchmark.planting}</td>
                    <td>{benchmark.harvesting}</td>
                    <td>{benchmark.spraying}</td>
                    <td>{benchmark.ploughing}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline gm-btn-sm"
                        onClick={() => onOpen(benchmark)}
                      >
                        Use insight
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-xl-4">
          <LabourInsight
            eyebrow={`${selected.county} · AI labour insight`}
            title="Make the total offer visible"
            body={selected.insight}
            action={
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onOpen(selected)}
              >
                <Sparkles /> Open action plan
              </button>
            }
          />
          <div className="gm-card p-3 mt-3">
            <span className="gm-eyebrow">Mary's current rate card</span>
            <div className="gm-check-row mt-2">
              <HandCoins />
              <span style={{ flex: 1 }}>
                <strong>Weeding</strong>
                <small>Active worker daily rate</small>
              </span>
              <strong className="font-display">KES 500</strong>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span style={{ flex: 1 }}>
                <strong>Spraying</strong>
                <small>Trained worker daily rate</small>
              </span>
              <strong className="font-display">KES 600</strong>
            </div>
            <div className="gm-check-row">
              <TrendingUp />
              <span style={{ flex: 1 }}>
                <strong>Harvesting</strong>
                <small>Piece-rate / team task</small>
              </span>
              <strong className="font-display">KES 600</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-2">
        <div className="col-lg-4">
          <LabourQuickMetric
            icon={<MapPin />}
            value="8"
            label="counties compared"
          />
        </div>
        <div className="col-lg-4">
          <LabourQuickMetric
            icon={<HandCoins />}
            value="KES 500–800"
            label="typical weeding band"
            tone="amber"
          />
        </div>
        <div className="col-lg-4">
          <LabourQuickMetric
            icon={<Sparkles />}
            value="3"
            label="AI actions on selected county"
            tone="sky"
          />
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Drawers                                                                    */
/* ========================================================================== */
function DrawerAvatar({ worker }: { worker: Worker }) {
  return <span className="gm-avatar">{worker.initials}</span>;
}

function PageDrawers({
  drawer,
  worker,
  task,
  day,
  payment,
  workers,
  tasks,
  onClose,
  onEditWorker,
  onAdvance,
  onCreateTask,
  onOpenTask,
  onOpenWorker,
}: {
  drawer: DrawerId;
  worker?: Worker;
  task?: LabourTask;
  day: CalendarDay | null;
  payment?: PayrollPayment;
  workers: Worker[];
  tasks: LabourTask[];
  onClose: () => void;
  onEditWorker: (id: string) => void;
  onAdvance: (id: string) => void;
  onCreateTask: () => void;
  onOpenTask: (id: string) => void;
  onOpenWorker: (id: string) => void;
}) {
  const workerTasks = worker
    ? tasks.filter((item) => item.workerIds.includes(worker.id)).slice(0, 5)
    : [];
  return (
    <>
      <DashboardDrawer
        open={drawer === "worker"}
        title={worker ? `${worker.name} · ${worker.id}` : "Worker detail"}
        onClose={onClose}
        footer={
          worker ? (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onEditWorker(worker.id)}
              >
                <Pencil /> Edit worker
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onAdvance(worker.id)}
              >
                <HandCoins /> Send advance
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={onCreateTask}
              >
                <Plus /> Assign task
              </button>
            </div>
          ) : null
        }
      >
        {worker ? (
          <div>
            <div className="gm-plan-detail-hero">
              <DrawerAvatar worker={worker} />
              <div style={{ flex: 1 }}>
                <span className="gm-eyebrow">
                  {worker.village}, {worker.county}
                </span>
                <h3 className="font-display mb-1">{worker.name}</h3>
                <div className="d-flex flex-wrap gap-1">
                  <StatusChip
                    label={statusLabel(worker.status)}
                    tone={toneForWorker(worker.status)}
                  />
                  <StatusChip
                    label={`${worker.rating || "New"} / 5`}
                    tone="low"
                  />
                </div>
              </div>
            </div>
            <div className="gm-plan-facts mt-3">
              <span>
                <Phone />
                <small>Phone</small>
                <a href={phoneHref(worker.phone)}>{worker.phone}</a>
              </span>
              <span>
                <Smartphone />
                <small>M-Pesa name</small>
                <strong>{worker.mpesaName}</strong>
              </span>
              <span>
                <HandCoins />
                <small>Daily rate</small>
                <strong>{money(worker.dailyRate)}</strong>
              </span>
              <span>
                <ClipboardList />
                <small>Tasks / earnings</small>
                <strong>
                  {worker.tasksCompleted} · {money(worker.totalEarned)}
                </strong>
              </span>
            </div>
            <div className="d-flex flex-wrap gap-1 mt-3">
              {worker.skills.map((skill) => (
                <span className="gm-chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <div className="gm-check-row mt-3">
              <FileText />
              <span>
                <strong>Notes</strong>
                <small>{worker.notes}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Emergency contact</strong>
                <small>{worker.emergencyContact || "Not added yet"}</small>
              </span>
            </div>
            <h4 className="font-display mt-4 mb-2">Recent work</h4>
            {workerTasks.map((item) => (
              <button
                type="button"
                className="gm-check-row w-100 text-start"
                key={item.id}
                onClick={() => onOpenTask(item.id)}
              >
                <span style={{ flex: 1 }}>
                  <strong>{item.title}</strong>
                  <small>
                    {item.date} · {item.crop}
                  </small>
                </span>
                <LabourStatusPill status={item.status} />
              </button>
            ))}
            {!workerTasks.length ? (
              <p className="text-muted">No task history yet.</p>
            ) : null}
          </div>
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "task"}
        title={task ? task.title : "Task detail"}
        onClose={onClose}
        footer={
          task ? (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onOpenTask(task.id)}
              >
                <Eye /> Keep open
              </button>
            </div>
          ) : null
        }
      >
        {task ? (
          <div>
            <div className="gm-plan-detail-hero">
              <div style={{ flex: 1 }}>
                <span className="gm-eyebrow">
                  {task.type} · {task.crop}
                </span>
                <h3 className="font-display mb-1">{task.title}</h3>
                <div className="d-flex flex-wrap gap-2">
                  <LabourStatusPill status={task.status} />
                  <span className="gm-chip">
                    <CalendarDays /> {task.date} · {task.startTime}
                  </span>
                </div>
              </div>
              <strong className="font-display" style={{ fontSize: "1.35rem" }}>
                {money(task.estimatedTotal)}
              </strong>
            </div>
            <div className="gm-plan-facts mt-3">
              <span>
                <MapPin />
                <small>Plot</small>
                <strong>{task.plot}</strong>
              </span>
              <span>
                <Clock3 />
                <small>Duration</small>
                <strong>{task.duration}</strong>
              </span>
              <span>
                <HandCoins />
                <small>Rate</small>
                <strong>
                  {task.rateType} · {money(task.rateAmount)}
                </strong>
              </span>
              <span>
                <Smartphone />
                <small>Payment</small>
                <strong>{task.paymentTiming}</strong>
              </span>
            </div>
            <h4 className="font-display mt-4 mb-2">Assigned team</h4>
            {task.workerIds.map((id) => {
              const item = workers.find((entry) => entry.id === id);
              return item ? (
                <button
                  type="button"
                  className="gm-check-row w-100 text-start"
                  key={id}
                  onClick={() => onOpenWorker(id)}
                >
                  <DrawerAvatar worker={item} />
                  <span style={{ flex: 1 }}>
                    <strong>{item.name}</strong>
                    <small>
                      {item.phone} · {item.skills.slice(0, 2).join(" · ")}
                    </small>
                  </span>
                  <span className="font-display">{money(item.dailyRate)}</span>
                </button>
              ) : null;
            })}
            <div className="gm-check-row mt-3">
              <FileText />
              <span>
                <strong>Instructions</strong>
                <small>{task.instructions}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Tools / PPE</strong>
                <small>{task.tools.join(" · ")}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <ClipboardCheck />
              <span>
                <strong>Attendance</strong>
                <small>
                  {
                    task.attendance.filter(
                      (entry) =>
                        entry.status === "Present" || entry.status === "Late",
                    ).length
                  }{" "}
                  present or late · {task.actualHours || "No"} actual hours
                </small>
              </span>
            </div>
          </div>
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "day"}
        title={day ? `Day detail · ${day.date}` : "Day detail"}
        onClose={onClose}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onCreateTask}
          >
            <Plus /> Add task on this day
          </button>
        }
      >
        {day ? (
          <div>
            <div className="gm-plan-total">
              <div>
                <span>Tasks</span>
                <strong className="font-display">{day.tasks.length}</strong>
              </div>
              <div>
                <span>Workers</span>
                <strong className="font-display">
                  {new Set(day.tasks.flatMap((item) => item.workerIds)).size}
                </strong>
              </div>
            </div>
            {day.tasks.map((item) => (
              <button
                type="button"
                className="gm-check-row w-100 text-start mt-2"
                key={item.id}
                onClick={() => onOpenTask(item.id)}
              >
                <span style={{ flex: 1 }}>
                  <strong>{item.title}</strong>
                  <small>
                    {item.startTime} · {item.plot} ·{" "}
                    {money(item.estimatedTotal)}
                  </small>
                </span>
                <LabourStatusPill status={item.status} />
              </button>
            ))}
            {!day.tasks.length ? (
              <div className="gm-plan-empty mt-3">
                <CalendarDays />
                <strong>No tasks booked</strong>
                <small>
                  Use the action below to turn this day into a plan.
                </small>
              </div>
            ) : null}
          </div>
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "receipt"}
        title={
          payment
            ? `Payment receipt · ${payment.workerName}`
            : "Payment receipt"
        }
        onClose={onClose}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onClose}
          >
            Done
          </button>
        }
      >
        {payment ? (
          <div>
            <div className="text-center py-2">
              <CheckCircle2
                style={{ color: "var(--gm-leaf-600)", width: 48, height: 48 }}
              />
              <span className="gm-eyebrow d-block mt-2">
                Settled M-Pesa record
              </span>
              <h3 className="font-display">
                {payment.receipt ?? "Receipt pending"}
              </h3>
            </div>
            <div className="gm-plan-payment-receipt">
              <div>
                <span>Worker</span>
                <strong>{payment.workerName}</strong>
              </div>
              <div>
                <span>Task</span>
                <strong>{payment.task}</strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>{money(payment.amount)}</strong>
              </div>
              <div>
                <span>Due date</span>
                <strong>{payment.dueDate}</strong>
              </div>
              <div>
                <span>Method</span>
                <strong>{payment.method}</strong>
              </div>
            </div>
            <a
              href={smsHref(
                workerByIdFromState(workers, payment.workerId)?.phone ??
                  "0712345678",
                `GrowMO receipt ${payment.receipt ?? "pending"} for ${money(payment.amount)}.`,
              )}
              className="gm-btn gm-btn-soft gm-btn-block mt-3"
            >
              <MessageSquare /> Share receipt by SMS
            </a>
          </div>
        ) : null}
      </DashboardDrawer>
      <DashboardDrawer
        open={drawer === "activity"}
        title="Payroll activity"
        onClose={onClose}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onClose}
          >
            Close activity
          </button>
        }
      >
        <div>
          {PAYROLL_ACTIVITY.map((item) => (
            <div className="gm-check-row" key={item.id}>
              <span className="gm-mega-icon">
                {item.kind === "money" ? (
                  <HandCoins />
                ) : item.kind === "worker" ? (
                  <Users />
                ) : (
                  <ClipboardList />
                )}
              </span>
              <span style={{ flex: 1 }}>
                <strong>{item.event}</strong>
                <small>{item.detail}</small>
                <small className="d-block text-muted">{item.at}</small>
              </span>
            </div>
          ))}
        </div>
        <LabourInsight
          eyebrow="Audit habit"
          title="Payroll activity is the paper trail"
          body="Keep the activity feed beside the receipt drawer when you review the weekly run. It shows who was paid, what attendance was sent and when the worker was added."
        />
      </DashboardDrawer>
    </>
  );
}
