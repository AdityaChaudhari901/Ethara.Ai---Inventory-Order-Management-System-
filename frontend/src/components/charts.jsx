/* Lightweight, dependency-free SVG charts tuned to the black/white/yellow theme. */

export function DonutChart({ segments, size = 168, thickness = 22, centerValue, centerLabel }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={thickness}
          />
          {segments.map((s, i) => {
            const len = (s.value / total) * circ;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                style={{ transition: "stroke-dasharray 600ms ease" }}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="signage nums text-3xl leading-none">{centerValue}</span>
        {centerLabel && (
          <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function Legend({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2.5 text-sm">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          <span className="flex-1 text-carbon/70">{it.label}</span>
          <span className="nums font-mono font-bold text-carbon">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

/* Horizontal bar list — the top bar is highlighted in hazard yellow. */
export function BarList({ items, format = (v) => v }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3.5">
      {items.map((it, idx) => (
        <li key={it.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-carbon">{it.label}</span>
            <span className="nums shrink-0 font-mono text-xs font-bold text-carbon">
              {format(it.value)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className={`h-full rounded-full ${idx === 0 ? "bg-hazard" : "bg-carbon"}`}
              style={{ width: `${Math.max(4, (it.value / max) * 100)}%`, transition: "width 600ms ease" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
