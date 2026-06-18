import { useEffect } from "react";

export function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-carbon/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg animate-stamp-in border-2 border-carbon bg-white shadow-hard sm:rounded-md"
      >
        <div className="hazard-stripe h-1.5" />
        <div className="flex items-start justify-between border-b-2 border-carbon px-6 py-4">
          <div>
            <h2 className="signage text-xl leading-tight">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-ink-muted">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md border-2 border-transparent p-1 text-ink-muted hover:border-carbon hover:text-carbon"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t-2 border-carbon px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
