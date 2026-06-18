import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Dashboard", end: true, icon: IconGrid },
  { to: "/products", label: "Products", icon: IconBox },
  { to: "/customers", label: "Customers", icon: IconUsers },
  { to: "/orders", label: "Orders", icon: IconReceipt },
];

export function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-carbon/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-carbon text-white transition-transform lg:static lg:m-3 lg:h-[calc(100vh-1.5rem)] lg:rounded-3xl lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand />
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-hazard text-carbon shadow-glow"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-5">
          <div className="rounded-2xl bg-white/[0.05] p-4">
            <p className="text-xs font-semibold text-white">Inventory & Orders</p>
            <p className="mt-0.5 text-[11px] text-white/45">Management System</p>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/5 bg-concrete/85 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-black/10 bg-white p-2 text-carbon"
            aria-label="Open navigation"
          >
            <IconMenu />
          </button>
          <span className="signage text-lg">Stockroom</span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 pb-2 pt-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-hazard font-display text-lg font-extrabold text-carbon shadow-glow">
        S
      </span>
      <div className="leading-tight">
        <p className="signage text-base text-white">Stockroom</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-hazard">
          Ops Console
        </p>
      </div>
    </div>
  );
}

/* --- icons --- */
function base(props) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
  };
}
function IconGrid() {
  return (
    <svg {...base()}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg {...base()}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg {...base()}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    </svg>
  );
}
function IconReceipt() {
  return (
    <svg {...base()}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg {...base()}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
