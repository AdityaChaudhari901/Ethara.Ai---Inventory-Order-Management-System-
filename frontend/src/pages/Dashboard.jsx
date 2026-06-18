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
    { label: "Products", value: data.total_products, to: "/products" },
    { label: "Customers", value: data.total_customers, to: "/customers" },
    { label: "Orders", value: data.total_orders, to: "/orders" },
    { label: "Inventory value", value: currency(data.total_inventory_value), to: "/products", wide: true },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="A live snapshot of stock, customers, and order activity across the warehouse."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-brand opacity-0 transition group-hover:opacity-100" />
            <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              {s.label}
            </p>
            <p
              className={`nums mt-2 font-display font-bold text-ink ${
                s.wide ? "text-2xl" : "text-3xl"
              }`}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Low stock</h2>
            {data.low_stock_count > 0 ? (
              <Badge tone="amber">{data.low_stock_count} need attention</Badge>
            ) : (
              <Badge tone="emerald">All healthy</Badge>
            )}
          </div>
          <span className="font-mono text-xs text-ink-muted">
            threshold ≤ {data.low_stock_threshold}
          </span>
        </header>

        {data.low_stock_products.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">
            No products are at or below the low-stock threshold. Inventory looks healthy.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.low_stock_products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.name}</p>
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
