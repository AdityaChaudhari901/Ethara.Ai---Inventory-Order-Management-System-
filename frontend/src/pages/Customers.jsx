import { useState } from "react";
import { Customers as CustomersApi, errorMessage } from "../api/client";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { Button, EmptyState, ErrorState, Field, Input, Spinner } from "../components/ui";
import { useFetch } from "../hooks/useFetch";

export default function Customers() {
  const toast = useToast();
  const { data: customers, loading, error, reload } = useFetch(CustomersApi.list, []);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await CustomersApi.remove(toDelete.id);
      toast.success(`Removed ${toDelete.full_name}`);
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
        eyebrow="Directory"
        title="Customers"
        description="The people and businesses you fulfil orders for."
        action={
          <Button variant="accent" onClick={() => setAdding(true)}>
            + Add customer
          </Button>
        }
      />

      {loading ? (
        <Spinner label="Loading customers" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          hint="Add a customer before creating their first order."
          action={
            <Button variant="accent" onClick={() => setAdding(true)}>
              + Add customer
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <div key={c.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-white">
                  {initials(c.full_name)}
                </span>
                <span className="font-mono text-[11px] text-ink-muted">#{c.id}</span>
              </div>
              <p className="mt-3 font-semibold text-ink">{c.full_name}</p>
              <p className="mt-0.5 truncate text-sm text-ink-muted">{c.email}</p>
              <p className="font-mono text-sm text-ink-soft">{c.phone || "—"}</p>
              <div className="mt-4 flex justify-end">
                <Button variant="danger" className="px-3 py-1.5" onClick={() => setToDelete(c)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <CustomerForm
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete customer"
        message={`Remove ${toDelete?.full_name}? Customers with existing orders can't be deleted.`}
      />
    </>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function CustomerForm({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await CustomersApi.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      toast.success(`Added ${form.full_name.trim()}`);
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
      title="Add customer"
      subtitle="Create a new customer record"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" form="customer-form" disabled={saving}>
            {saving ? "Saving…" : "Add customer"}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={submit} className="space-y-4">
        <Field label="Full name" error={errors.full_name}>
          <Input value={form.full_name} onChange={set("full_name")} invalid={!!errors.full_name} placeholder="e.g. Maria Gomez" autoFocus />
        </Field>
        <Field label="Email" error={errors.email} hint="Must be unique">
          <Input type="email" value={form.email} onChange={set("email")} invalid={!!errors.email} placeholder="maria@example.com" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={set("phone")} placeholder="+1 555 0100" className="font-mono" />
        </Field>
      </form>
    </Modal>
  );
}
