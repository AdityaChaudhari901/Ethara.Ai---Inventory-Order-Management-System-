import { stockStatus } from "../lib/format";

/* Button — carbon (primary), hazard (accent), ghost, danger. Soft + rounded. */
export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-hazard focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-carbon text-white shadow-lift hover:bg-carbon-soft active:translate-y-px",
    accent: "bg-hazard text-carbon font-bold shadow-glow hover:brightness-105 active:translate-y-px",
    ghost: "border border-black/10 bg-white text-carbon hover:bg-black/[0.03] active:translate-y-px",
    danger: "border border-signal/25 bg-white text-signal-deep hover:bg-signal/5 active:translate-y-px",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-signal-deep">{error}</span>}
    </label>
  );
}

export function Input({ invalid, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-carbon placeholder:text-ink-muted/60 transition focus:outline-none focus:ring-2 focus:ring-hazard/50 ${
        invalid ? "border-signal" : "border-black/10 focus:border-carbon/30"
      } ${className}`}
      {...props}
    />
  );
}

export function Select({ invalid, className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-carbon transition focus:outline-none focus:ring-2 focus:ring-hazard/50 ${
        invalid ? "border-signal" : "border-black/10 focus:border-carbon/30"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/* SKU / code chip — subtle mono pill. */
export function SkuChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-black/[0.05] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-tight text-carbon/80">
      {children}
    </span>
  );
}

/* Stock meter — smooth rounded gauge; black = in stock, yellow = low, red = out. */
export function StockMeter({ qty, threshold = 10, max, showLabel = true }) {
  const status = stockStatus(qty, threshold);
  const ceiling = max || Math.max(threshold * 4, qty, 1);
  const pct = Math.min(100, Math.max(qty <= 0 ? 0 : 6, (qty / ceiling) * 100));
  const fill = { ok: "bg-carbon", low: "bg-hazard", out: "bg-signal" }[status];
  const text = { ok: "text-carbon", low: "text-hazard-deep", out: "text-signal-deep" }[status];
  const labels = { ok: "In stock", low: "Low", out: "Out" };
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-black/[0.08]">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="nums w-7 font-mono text-sm font-bold text-carbon">{qty}</span>
      {showLabel && <span className={`text-[11px] font-semibold ${text}`}>{labels[status]}</span>}
    </div>
  );
}

export function Badge({ tone = "carbon", children }) {
  const tones = {
    carbon: "bg-carbon/[0.06] text-carbon",
    hazard: "bg-hazard/20 text-hazard-deep",
    go: "bg-go/10 text-go-deep",
    signal: "bg-signal/10 text-signal-deep",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-carbon" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 bg-white/60 py-16 text-center">
      <p className="signage text-lg">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-signal/30 bg-signal/5 p-6 text-center">
      <p className="font-display font-bold text-signal-deep">Couldn't load this data</p>
      <p className="mt-1 text-sm text-signal-deep/90">{message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
