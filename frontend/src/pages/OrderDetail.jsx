import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Customers as CustomersApi, Orders as OrdersApi, Products as ProductsApi } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { Badge, ErrorState, SkuChip, Spinner } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { currency, dateTime } from "../lib/format";

export default function OrderDetail() {
  const { id } = useParams();

  const fetcher = useCallback(async () => {
    const order = await OrdersApi.get(id);
    const [products, customer] = await Promise.all([
      ProductsApi.list(),
      CustomersApi.get(order.customer_id).catch(() => null),
    ]);
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    return { order, customer, productById: byId };
  }, [id]);

  const { data, loading, error, reload } = useFetch(fetcher, [id]);

  if (loading) return <Spinner label="Loading order" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { order, customer, productById } = data;

  return (
    <>
      <div className="mb-4">
        <Link to="/orders" className="font-mono text-xs font-medium text-ink-muted hover:text-ink">
          ← Back to orders
        </Link>
      </div>

      <PageHeader
        eyebrow={`Placed ${dateTime(order.created_at)}`}
        title={`Order #${String(order.id).padStart(4, "0")}`}
        action={<Badge tone="go">{order.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.015] text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    <th className="px-5 py-3.5 font-semibold">Product</th>
                    <th className="px-5 py-3.5 font-semibold">Unit price</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Qty</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {order.items.map((item) => {
                    const p = productById[item.product_id];
                    return (
                      <tr key={item.id}>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-ink">{p ? p.name : `Product #${item.product_id}`}</p>
                          {p && (
                            <span className="mt-1 inline-block">
                              <SkuChip>{p.sku}</SkuChip>
                            </span>
                          )}
                        </td>
                        <td className="nums px-5 py-3.5 font-mono text-ink-soft">{currency(item.unit_price)}</td>
                        <td className="nums px-5 py-3.5 text-center font-mono text-ink-soft">{item.quantity}</td>
                        <td className="nums px-5 py-3.5 text-right font-mono font-semibold text-ink">
                          {currency(item.line_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black/5 bg-black/[0.02]">
                    <td colSpan={3} className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Order total
                    </td>
                    <td className="nums px-5 py-3.5 text-right font-display text-xl font-extrabold text-carbon">
                      {currency(order.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        <aside>
          <div className="card p-6">
            <p className="eyebrow">Customer</p>
            {customer ? (
              <>
                <p className="mt-2 font-display font-bold uppercase tracking-tight text-carbon">{customer.full_name}</p>
                <p className="text-sm text-ink-muted">{customer.email}</p>
                <p className="font-mono text-sm text-ink-soft">{customer.phone || "—"}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Customer #{order.customer_id}</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
