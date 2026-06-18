import { useState } from "react";
import { Products as ProductsApi, errorMessage } from "../api/client";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { Button, EmptyState, ErrorState, Field, Input, SkuChip, Spinner, StockMeter } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { currency } from "../lib/format";

const EMPTY = { name: "", sku: "", price: "", quantity_in_stock: "" };

export default function Products() {
  const toast = useToast();
  const { data: products, loading, error, reload } = useFetch(ProductsApi.list, []);

  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id...} = edit
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await ProductsApi.remove(toDelete.id);
      toast.success(`Deleted "${toDelete.name}"`);
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
        eyebrow="Catalog"
        title="Products"
        description="Track stock levels, pricing, and SKUs for every item in the warehouse."
        action={
          <Button variant="accent" onClick={() => setEditing({ ...EMPTY })}>
            + Add product
          </Button>
        }
      />

      {loading ? (
        <Spinner label="Loading products" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          hint="Add your first product to start tracking inventory and accepting orders."
          action={
            <Button variant="accent" onClick={() => setEditing({ ...EMPTY })}>
              + Add product
            </Button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.015] text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">SKU</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {products.map((p) => (
                  <tr key={p.id} className="transition hover:bg-black/[0.015]">
                    <td className="px-5 py-3.5 font-semibold text-carbon">{p.name}</td>
                    <td className="px-5 py-3.5">
                      <SkuChip>{p.sku}</SkuChip>
                    </td>
                    <td className="nums px-5 py-3.5 font-mono font-medium text-carbon">{currency(p.price)}</td>
                    <td className="px-5 py-3.5">
                      <StockMeter qty={p.quantity_in_stock} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="px-3 py-1.5" onClick={() => setEditing(p)}>
                          Edit
                        </Button>
                        <Button variant="danger" className="px-3 py-1.5" onClick={() => setToDelete(p)}>
                          Delete
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

      {editing && (
        <ProductForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete product"
        message={`Delete "${toDelete?.name}"? This can't be undone. Products referenced by existing orders can't be deleted.`}
      />
    </>
  );
}

function ProductForm({ initial, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    sku: initial.sku ?? "",
    price: initial.price ?? "",
    quantity_in_stock: initial.quantity_in_stock ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price === "" || Number(form.price) < 0 || Number.isNaN(Number(form.price)))
      e.price = "Enter a price of 0 or more";
    if (
      form.quantity_in_stock === "" ||
      Number(form.quantity_in_stock) < 0 ||
      !Number.isInteger(Number(form.quantity_in_stock))
    )
      e.quantity_in_stock = "Enter a whole number, 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };
    try {
      if (isEdit) {
        await ProductsApi.update(initial.id, payload);
        toast.success(`Updated "${payload.name}"`);
      } else {
        await ProductsApi.create(payload);
        toast.success(`Added "${payload.name}"`);
      }
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit product" : "Add product"}
      subtitle={isEdit ? `SKU ${initial.sku}` : "Create a new item in the catalog"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" form="product-form" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4">
        <Field label="Product name" error={errors.name}>
          <Input value={form.name} onChange={set("name")} invalid={!!errors.name} placeholder="e.g. Aluminium Tripod" autoFocus />
        </Field>
        <Field label="SKU / code" error={errors.sku} hint="Must be unique across the catalog">
          <Input value={form.sku} onChange={set("sku")} invalid={!!errors.sku} placeholder="e.g. TRP-A100" className="font-mono" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" error={errors.price}>
            <Input type="number" step="0.01" min="0" value={form.price} onChange={set("price")} invalid={!!errors.price} placeholder="0.00" />
          </Field>
          <Field label="Quantity in stock" error={errors.quantity_in_stock}>
            <Input type="number" step="1" min="0" value={form.quantity_in_stock} onChange={set("quantity_in_stock")} invalid={!!errors.quantity_in_stock} placeholder="0" />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
