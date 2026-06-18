import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Customers as CustomersApi,
  Orders as OrdersApi,
  Products as ProductsApi,
  errorMessage,
} from "../api/client";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { Badge, Button, EmptyState, ErrorState, Field, Input, Select, Spinner } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { currency, dateTime } from "../lib/format";

export default function Orders() {
  const toast = useToast();
  const { data: orders, loading, error, reload } = useFetch(OrdersApi.list, []);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await OrdersApi.remove(toDelete.id);
      toast.success(`Order #${toDelete.id} cancelled — stock restored`);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Create orders against live inventory. Stock is reserved the moment an order is placed."
        action={
          <Button variant="accent" onClick={() => setCreating(true)}>
            + New order
          </Button>
        }
      />

      {loading ? (
        <Spinner label="Loading orders" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          hint="Create an order to draw down inventory and record a sale."
          action={
            <Button variant="accent" onClick={() => setCreating(true)}>
              + New order
            </Button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.015] text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Items</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Placed</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-black/[0.015]">
                    <td className="px-5 py-3.5">
                      <Link to={`/orders/${o.id}`} className="font-mono font-bold text-carbon underline-offset-4 hover:underline hover:decoration-hazard hover:decoration-2">
                        #{String(o.id).padStart(4, "0")}
                      </Link>
                    </td>
                    <td className="nums px-5 py-3.5 text-ink-soft">
                      {o.items.reduce((n, i) => n + i.quantity, 0)} units / {o.items.length} line
                      {o.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="nums px-5 py-3.5 font-mono font-bold text-carbon">{currency(o.total_amount)}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone="go">{o.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{dateTime(o.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Link to={`/orders/${o.id}`}>
                          <Button variant="ghost" className="px-3 py-1.5">
                            View
                          </Button>
                        </Link>
                        <Button variant="danger" className="px-3 py-1.5" onClick={() => setToDelete(o)}>
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {creating && (
        <OrderForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        busy={busy}
        confirmLabel="Cancel order"
        title="Cancel order"
        message={`Cancel order #${toDelete?.id}? The ordered quantities will be returned to stock.`}
      />
    </>
  );
}

function OrderForm({ onClose, onSaved }) {
  const toast = useToast();
  const { data: products, loading: lp } = useFetch(ProductsApi.list, []);
  const { data: customers, loading: lc } = useFetch(CustomersApi.list, []);

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const productMap = useMemo(
    () => Object.fromEntries((products || []).map((p) => [String(p.id), p])),
    [products]
  );

  const total = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = productMap[l.product_id];
        return sum + (p ? Number(p.price) * Number(l.quantity || 0) : 0);
      }, 0),
    [lines, productMap]
  );

  const addLine = () => setLines((l) => [...l, { product_id: "", quantity: 1 }]);
  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i, patch) =>
    setLines((l) => l.map((line, idx) => (idx === i ? { ...line, ...patch } : line)));

  function validate() {
    if (!customerId) return "Select a customer for this order.";
    const filled = lines.filter((l) => l.product_id);
    if (filled.length === 0) return "Add at least one product line.";
    for (const l of filled) {
      const p = productMap[l.product_id];
      const qty = Number(l.quantity);
      if (!Number.isInteger(qty) || qty <= 0) return `Quantity for "${p?.name}" must be a whole number above 0.`;
      if (p && qty > p.quantity_in_stock)
        return `Only ${p.quantity_in_stock} of "${p.name}" in stock (you asked for ${qty}).`;
    }
    return "";
  }

  async function submit(ev) {
    ev.preventDefault();
    const msg = validate();
    if (msg) {
      setFormError(msg);
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const order = await OrdersApi.create({
        customer_id: Number(customerId),
        items: lines
          .filter((l) => l.product_id)
          .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) })),
      });
      toast.success(`Order #${order.id} placed — ${currency(order.total_amount)}`);
      onSaved();
    } catch (err) {
      // Server is the source of truth for stock; surface its message inline too.
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const noProducts = !lp && (products || []).length === 0;
  const noCustomers = !lc && (customers || []).length === 0;

  return (
    <Modal
      open
      onClose={onClose}
      title="New order"
      subtitle="Stock is checked and reserved on submit"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" form="order-form" disabled={saving || noProducts || noCustomers}>
            {saving ? "Placing…" : `Place order · ${currency(total)}`}
          </Button>
        </>
      }
    >
      {lp || lc ? (
        <Spinner label="Loading catalog" />
      ) : noProducts || noCustomers ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          You need at least one {noCustomers ? "customer" : ""}
          {noCustomers && noProducts ? " and one " : ""}
          {noProducts ? "product" : ""} before creating an order.
        </p>
      ) : (
        <form id="order-form" onSubmit={submit} className="space-y-5">
          <Field label="Customer">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} · {c.email}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Line items</span>
              <button type="button" onClick={addLine} className="text-xs font-semibold text-brand-deep hover:underline">
                + Add line
              </button>
            </div>
            <div className="space-y-2.5">
              {lines.map((line, i) => {
                const p = productMap[line.product_id];
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <Select value={line.product_id} onChange={(e) => updateLine(i, { product_id: e.target.value })}>
                        <option value="">Select product…</option>
                        {products.map((pr) => (
                          <option key={pr.id} value={pr.id} disabled={pr.quantity_in_stock <= 0}>
                            {pr.name} — {currency(pr.price)} ({pr.quantity_in_stock} in stock)
                          </option>
                        ))}
                      </Select>
                      {p && (
                        <p className="mt-1 font-mono text-[11px] text-ink-muted">
                          {p.quantity_in_stock} available · line {currency(Number(p.price) * Number(line.quantity || 0))}
                        </p>
                      )}
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, { quantity: e.target.value })}
                        className="text-center"
                        aria-label="Quantity"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="mt-1.5 px-1 text-ink-muted hover:text-rose-600 disabled:opacity-30"
                      aria-label="Remove line"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-carbon px-5 py-4 text-white">
            <span className="text-xs font-semibold uppercase tracking-wide text-hazard">Order total</span>
            <span className="nums font-display text-2xl font-extrabold">{currency(total)}</span>
          </div>

          {formError && (
            <p className="rounded-xl border border-signal/30 bg-signal/5 px-3.5 py-2.5 text-sm font-semibold text-signal-deep">
              {formError}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
