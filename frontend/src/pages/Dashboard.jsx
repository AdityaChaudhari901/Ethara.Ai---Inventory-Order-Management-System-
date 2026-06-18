import { Link } from "react-router-dom";
import { Dashboard as DashboardApi } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { Badge, ErrorState, SkuChip, Spinner, StockMeter } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { currency } from "../lib/format";

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(DashboardApi.summary, []);

  if (loading) return <Spinner label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const stats = [
    { label: "Products", value: data.total_products, code: "SKU", to: "/products" },
    { label: "Customers", value: data.total_customers, code: "CST", to: "/customers" },
    { label: "Orders", value: data.total_orders, code: "ORD", to: "/orders" },
    {
      label: "Inventory value",
      value: currency(data.total_inventory_value),
      code: "VAL",
      to: "/products",
      wide: true,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Terminal Overview"
        title="Operations Dashboard"
        description="A live snapshot of stock, customers, and order activity across the warehouse."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden border-2 border-carbon bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-hard-sm"
          >
            <div className="flex items-start justify-between">
              <span className="eyebrow">{s.label}</span>
              <span className="font-mono text-[10px] font-semibold text-ink-muted">{s.code}</span>
            </div>
            <p
              className={`signage nums mt-3 leading-none ${s.wide ? "text-2xl" : "text-4xl"}`}
            >
              {s.value}
            </p>
            <div className="mt-3 h-1 w-8 bg-hazard transition-all group-hover:w-16" />
          </Link>
        ))}
      </div>

      <section className="mt-8 overflow-hidden border-2 border-carbon bg-white">
        <header className="flex items-center justify-between border-b-2 border-carbon bg-carbon px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Low stock
            </h2>
            {data.low_stock_count > 0 ? (
              <Badge tone="hazard">{data.low_stock_count} need attention</Badge>
            ) : (
              <Badge tone="go">All healthy</Badge>
            )}
          </div>
          <span className="hidden font-mono text-[11px] uppercase tracking-wide text-concrete/60 sm:block">
            threshold ≤ {data.low_stock_threshold}
          </span>
        </header>

        {data.low_stock_products.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">
            No products are at or below the low-stock threshold. Inventory looks healthy.
          </p>
        ) : (
          <ul className="divide-y divide-paperline">
            {data.low_stock_products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-concrete/40">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-carbon">{p.name}</p>
                  <div className="mt-1">
                    <SkuChip>{p.sku}</SkuChip>
                  </div>
                </div>
                <StockMeter qty={p.quantity_in_stock} threshold={data.low_stock_threshold} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
