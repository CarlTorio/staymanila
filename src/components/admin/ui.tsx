import { Loader2 } from "lucide-react";

export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-white border border-black/10 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminButton({
  variant = "primary",
  className = "",
  loading = false,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "outline";
  loading?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: "text-white hover:opacity-90",
    ghost: "bg-transparent text-black/80 hover:bg-black/5",
    danger: "bg-red-600 text-white hover:bg-red-500",
    outline:
      "bg-transparent border border-black/15 text-[#1C1C1E] hover:bg-black/5",
  };
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
      style={
        variant === "primary"
          ? { backgroundColor: "var(--color-accent)", ...rest.style }
          : rest.style
      }
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-md bg-black/5 border border-black/10 text-[#1C1C1E] placeholder-black/40 outline-none focus:border-[#C8A96E] ${props.className ?? ""}`}
    />
  );
}

export function AdminTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-md bg-black/5 border border-black/10 text-[#1C1C1E] placeholder-black/40 outline-none focus:border-[#C8A96E] ${props.className ?? ""}`}
    />
  );
}

export function AdminLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-black/60 mb-1.5">
      {children}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white border border-black/10 rounded-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h3 className="font-semibold text-[#1C1C1E]">{title}</h3>
          <button
            onClick={onClose}
            className="text-black/60 hover:text-[#1C1C1E] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-black/10 rounded-xl w-full max-w-md p-6"
      >
        <h3 className="font-semibold text-[#1C1C1E] mb-2">{title}</h3>
        <p className="text-sm text-black/70 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <AdminButton variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#1C1C1E]">{title}</h2>
        {subtitle && (
          <p className="text-sm text-black/60 mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-black/5 animate-pulse" />
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "" : "bg-black/15"
      }`}
      style={checked ? { backgroundColor: "var(--color-accent)" } : undefined}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
