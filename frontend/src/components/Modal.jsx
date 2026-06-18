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
        className="absolute inset-0 animate-fade-in bg-carbon/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg animate-pop-in rounded-t-3xl bg-white shadow-soft sm:rounded-3xl"
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-6">
          <div>
            <h2 className="signage text-xl leading-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.04] hover:text-carbon"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-2">{children}</div>
        {footer && (
          <div className="mt-2 flex justify-end gap-3 border-t border-black/5 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
