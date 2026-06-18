import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Dashboard as DashboardApi, Products as ProductsApi } from "../api/client";
import { BarList, DonutChart, Legend } from "../components/charts";
import { PageHeader } from "../components/PageHeader";
import { Badge, ErrorState, SkuChip, Spinner, StockMeter } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { compactCurrency, currency } from "../lib/format";

const C = { in: "#141416", low: "#FFC400", out: "#E2462F" };

export default function Dashboard() {
  const fetcher = useCallback(async () => {
    const [summary, products] = await Promise.all([DashboardApi.summary(), ProductsApi.list()]);
    return { summary, products };
  }, []);
  const { data, loading, error, reload } = useFetch(fetcher, []);

  if (loading) return <Spinner label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { summary, products } = data;
  const t = summary.low_stock_threshold;

  const inStock = products.filter((p) => p.quantity_in_stock > t).length;
  const low = products.filter((p) => p.quantity_in_stock > 0 && p.quantity_in_stock <= t).length;
  const out = products.filter((p) => p.quantity_in_stock <= 0).length;

  const topValue = [...products]
    .map((p) => ({ label: p.name, value: Number(p.price) * p.quantity_in_stock }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stats = [
    { label: "Products", value: summary.total_products, to: "/products", icon: IBox },
    { label: "Customers", value: summary.total_customers, to: "/customers", icon: IUsers },
    { label: "Orders", value: summary.total_orders, to: "/orders", icon: IReceipt },
    {
      label: "Inventory value",
      value: currency(summary.total_inventory_value),
      to: "/products",
      icon: IRupee,
      accent: true,
      small: true,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live snapshot of stock, customers, and order activity across your business."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                s.accent ? "bg-hazard text-carbon" : "bg-black/[0.04] text-carbon"
              }`}
            >
              <s.icon />
            </div>
            <p className="text-xs font-semibold text-ink-muted">{s.label}</p>
            <p className={`signage nums mt-1 leading-none ${s.small ? "text-2xl" : "text-3xl"}`}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="card p-6">
          <h2 className="signage text-lg">Inventory status</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Across {products.length} products</p>
          {products.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">No products yet.</p>
          ) : (
            <div className="mt-5 flex items-center gap-6">
              <DonutChart
                centerValue={products.length}
                centerLabel="SKUs"
                segments={[
                  { label: "In stock", value: inStock, color: C.in },
                  { label: "Low", value: low, color: C.low },
                  { label: "Out", value: out, color: C.out },
                ]}
              />
              <div className="flex-1">
                <Legend
                  items={[
                    { label: "In stock", value: inStock, color: C.in },
                    { label: "Low stock", value: low, color: C.low },
                    { label: "Out of stock", value: out, color: C.out },
                  ]}
                />
              </div>
            </div>
          )}
        </section>

        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="signage text-lg">Top products by value</h2>
              <p className="mt-0.5 text-xs text-ink-muted">price × quantity in stock</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-hazard-deep hover:underline">
              View all →
            </Link>
          </div>
          {topValue.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">No products yet.</p>
          ) : (
            <div className="mt-6">
              <BarList items={topValue} format={compactCurrency} />
            </div>
          )}
        </section>
      </div>

      {/* Low stock */}
      <section className="card mt-5 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="signage text-lg">Low stock</h2>
            {summary.low_stock_count > 0 ? (
              <Badge tone="hazard">{summary.low_stock_count} need attention</Badge>
            ) : (
              <Badge tone="go">All healthy</Badge>
            )}
          </div>
          <span className="hidden text-xs text-ink-muted sm:block">threshold ≤ {t}</span>
        </header>
        {summary.low_stock_products.length === 0 ? (
          <p className="px-6 pb-10 pt-2 text-center text-sm text-ink-muted">
            No products are at or below the low-stock threshold. Inventory looks healthy.
          </p>
        ) : (
          <ul className="border-t border-black/5">
            {summary.low_stock_products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 border-b border-black/5 px-6 py-3.5 last:border-0 hover:bg-black/[0.015]"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-carbon">{p.name}</p>
                  <div className="mt-1">
                    <SkuChip>{p.sku}</SkuChip>
                  </div>
                </div>
                <StockMeter qty={p.quantity_in_stock} threshold={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/* --- stat-card icons --- */
function ib(props) {
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
function IBox() {
  return (
    <svg {...ib()}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}
function IUsers() {
  return (
    <svg {...ib()}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}
function IReceipt() {
  return (
    <svg {...ib()}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}
function IRupee() {
  return (
    <svg {...ib()}>
      <path d="M6 3h12M6 8h12M9 13c4 0 4-5 0-5M6 13h4l5 8" />
    </svg>
  );
}
