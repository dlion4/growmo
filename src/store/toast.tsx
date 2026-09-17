import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type ToastKind = "success" | "info" | "warn";

export interface ToastItem {
  id: number;
  msg: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toasts: ToastItem[];
  notify: (msg: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (msg: string, kind: ToastKind = "success") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, msg, kind }]);
      setTimeout(() => dismiss(id), 2800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  info: Info,
  warn: TriangleAlert,
};

/* Rendered once in __root — themed via .gm-toast-stack in master theme */
export function ToastHost() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="gm-toast-stack" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <button key={t.id} type="button" className={`gm-toast is-visible gm-toast-${t.kind}`} onClick={() => dismiss(t.id)}>
            <Icon /> <span>{t.msg}</span>
          </button>
        );
      })}
    </div>
  );
}
