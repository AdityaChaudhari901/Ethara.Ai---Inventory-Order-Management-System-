import { stockStatus } from "../lib/format";

/* Button — ink (primary), amber (signature CTA), ghost, danger. */
export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-ink text-white hover:bg-ink-soft",
    accent: "bg-brand text-ink hover:bg-amber-400 shadow-sm",
    ghost: "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50",
    danger: "bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

/* Labelled form field with validation message. */
export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

export function Input({ invalid, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/60 ${
        invalid ? "border-rose-300" : "border-slate-200"
      } ${className}`}
      {...props}
    />
  );
}

export function Select({ invalid, className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/60 ${
        invalid ? "border-rose-300" : "border-slate-200"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/* SKU / code chip — mono, reads like a machine label. */
export function SkuChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-ink-soft">
      {children}
    </span>
  );
}

/* Signature element: a stock meter encoding quantity health by color + fill. */
export function StockMeter({ qty, threshold = 10, max }) {
  const status = stockStatus(qty, threshold);
  const ceiling = max || Math.max(threshold * 4, qty, 1);
  const pct = Math.min(100, Math.max(qty <= 0 ? 0 : 6, (qty / ceiling) * 100));
  const colors = {
    ok: "bg-emerald-500",
    low: "bg-brand",
    out: "bg-rose-500",
  };
  const labels = { ok: "In stock", low: "Low", out: "Out" };
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="nums font-mono text-xs font-semibold text-ink">{qty}</span>
      <span
        className={`text-[11px] font-medium ${
          status === "ok" ? "text-emerald-600" : status === "low" ? "text-brand-deep" : "text-rose-600"
        }`}
      >
        {labels[status]}
      </span>
    </div>
  );
}

export function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-ink-soft",
    emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    amber: "bg-brand-soft text-brand-deep ring-1 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-ink" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
      <p className="font-semibold text-rose-700">Couldn't load this data</p>
      <p className="mt-1 text-sm text-rose-600">{message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
