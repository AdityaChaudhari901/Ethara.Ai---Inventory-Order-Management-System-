import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex animate-slide-up items-stretch gap-0 border-2 border-carbon bg-white shadow-hard-sm"
          >
            <span className={`w-1.5 ${t.tone === "error" ? "bg-signal" : "bg-go"}`} />
            <div className="flex flex-1 items-start gap-3 px-3.5 py-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {t.tone === "error" ? "ERR" : "OK"}
              </span>
              <p className="flex-1 text-sm text-carbon">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-ink-muted hover:text-carbon"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
