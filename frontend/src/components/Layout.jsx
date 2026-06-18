import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Dashboard", end: true, icon: IconGrid, code: "00" },
  { to: "/products", label: "Products", icon: IconBox, code: "01" },
  { to: "/customers", label: "Customers", icon: IconUsers, code: "02" },
  { to: "/orders", label: "Orders", icon: IconReceipt, code: "03" },
];

export function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* hazard tape across the very top */}
      <div className="hazard-stripe fixed inset-x-0 top-0 z-50 h-1.5" />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-carbon/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 mt-1.5 flex w-64 flex-col border-r-2 border-carbon bg-carbon text-concrete transition-transform lg:static lg:mt-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand />
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-display font-semibold uppercase tracking-wide transition ${
                  isActive
                    ? "bg-carbon-soft text-white"
                    : "text-concrete/55 hover:bg-carbon-soft/60 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-hazard transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                  <item.icon />
                  <span className="flex-1">{item.label}</span>
                  <span className="font-mono text-[10px] text-concrete/35">{item.code}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-carbon-line px-5 py-4">
          <p className="font-mono text-[10px] leading-relaxed uppercase tracking-wide text-concrete/40">
            Inventory &amp; Order
            <br />
            Management Terminal
          </p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hazard-edge sticky top-1.5 z-20 flex items-center gap-3 border-b-2 border-carbon bg-concrete/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md border-2 border-carbon p-2 text-carbon"
            aria-label="Open navigation"
          >
            <IconMenu />
          </button>
          <span className="signage text-lg">Stockroom</span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b-2 border-carbon-line px-5 py-5">
      <span className="hazard-stripe flex h-10 w-10 items-center justify-center rounded-md border-2 border-white/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-carbon font-display text-sm font-extrabold text-hazard">
          S
        </span>
      </span>
      <div className="leading-tight">
        <p className="signage text-base text-white">Stockroom</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-hazard">
          Freight Terminal
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
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
