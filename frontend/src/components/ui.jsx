import { stockStatus } from "../lib/format";

/* Button — carbon (primary), hazard (signature CTA, stamped), ghost, danger.
   All share hard 2px carbon borders; the hazard CTA gets a tactile press. */
export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-hazard focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "border-carbon bg-carbon text-white hover:bg-carbon-soft active:translate-y-px",
    accent:
      "border-carbon bg-hazard text-carbon shadow-hard-sm hover:brightness-105 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    ghost: "border-carbon bg-white text-carbon hover:bg-concrete active:translate-y-px",
    danger: "border-signal bg-white text-signal-deep hover:bg-signal/10 active:translate-y-px",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && (
        <span className="mt-1 block text-xs font-semibold text-signal-deep">{error}</span>
      )}
    </label>
  );
}

export function Input({ invalid, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border-2 bg-white px-3 py-2 text-sm text-carbon placeholder:text-ink-muted/60 focus:outline-none focus:border-carbon focus:ring-2 focus:ring-hazard/50 ${
        invalid ? "border-signal" : "border-paperline"
      } ${className}`}
      {...props}
    />
  );
}

export function Select({ invalid, className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-md border-2 bg-white px-3 py-2 text-sm text-carbon focus:outline-none focus:border-carbon focus:ring-2 focus:ring-hazard/50 ${
        invalid ? "border-signal" : "border-paperline"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/* SKU / code chip — looks like a stamped freight label. */
export function SkuChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-[3px] border border-carbon bg-concrete px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-tight text-carbon">
      {children}
    </span>
  );
}

/* Signature element: a mechanical, ticked stock gauge. */
export function StockMeter({ qty, threshold = 10, max }) {
  const status = stockStatus(qty, threshold);
  const ceiling = max || Math.max(threshold * 4, qty, 1);
  const pct = Math.min(100, Math.max(qty <= 0 ? 0 : 5, (qty / ceiling) * 100));
  const fill = { ok: "bg-go", low: "bg-hazard", out: "bg-signal" }[status];
  const text = {
    ok: "text-go-deep",
    low: "text-hazard-deep",
    out: "text-signal-deep",
  }[status];
  const labels = { ok: "IN STOCK", low: "LOW", out: "OUT" };
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-3 w-28 overflow-hidden rounded-[3px] border-2 border-carbon bg-white">
        <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
        {/* tick marks overlaid to read like a gauge */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(23,24,27,0.45) 9px, rgba(23,24,27,0.45) 10px)",
          }}
        />
      </div>
      <span className="nums w-8 font-mono text-sm font-bold text-carbon">{qty}</span>
      <span className={`font-mono text-[10px] font-bold tracking-wide ${text}`}>{labels[status]}</span>
    </div>
  );
}

export function Badge({ tone = "carbon", children }) {
  const tones = {
    carbon: "border-carbon bg-white text-carbon",
    go: "border-go bg-go/10 text-go-deep",
    hazard: "border-carbon bg-hazard text-carbon",
    signal: "border-signal bg-signal/10 text-signal-deep",
  };
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 font-mono text-sm uppercase tracking-wide text-ink-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-paperline border-t-carbon" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-paperline bg-white/50 py-16 text-center">
      <p className="signage text-lg">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-md border-2 border-signal bg-signal/5 p-6 text-center">
      <p className="font-display font-bold uppercase tracking-wide text-signal-deep">
        Couldn't load this data
      </p>
      <p className="mt-1 text-sm text-signal-deep/90">{message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
