"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";

interface CancellationReason {
  id: number;
  code: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginatedReasons {
  data: CancellationReason[];
  next_page_url: string | null;
  prev_page_url: string | null;
}

export default function CancellationReasonsPage() {
  const router = useRouter();
  const [reasons, setReasons] = useState<CancellationReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: "",
    label: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function loadReasons() {
    setLoading(true);
    try {
      const res = await fetch("/api/platform/cancellation-reasons", {
        credentials: "include",
        headers: { "X-Tenant": "platform", Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load reasons");
      const data: PaginatedReasons = await res.json();
      setReasons(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReasons();
  }, []);

  function startCreate() {
    setEditingId(0);
    setForm({ code: "", label: "", description: "", sort_order: reasons.length + 1, is_active: true });
    setShowModal(true);
  }

  function startEdit(reason: CancellationReason) {
    setEditingId(reason.id);
    setForm({
      code: reason.code,
      label: reason.label,
      description: reason.description ?? "",
      sort_order: reason.sort_order,
      is_active: reason.is_active,
    });
    setShowModal(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowModal(false);
    setForm({ code: "", label: "", description: "", sort_order: 0, is_active: true });
  }

  async function handleSave() {
    if (!form.code || !form.label) {
      setError("Code and label are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/platform/cancellation-reasons/${editingId}`
        : "/api/platform/cancellation-reasons";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tenant": "platform" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Save failed");
      }
      cancelEdit();
      await loadReasons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this cancellation reason? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/platform/cancellation-reasons/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-Tenant": "platform" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Delete failed");
      }
      await loadReasons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto p-6 w-full max-w-[95%]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cancellation Reasons</h1>
        <Button onClick={startCreate}>Add reason</Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-bad-bg text-bad-fg border border-bad-fg/25" role="alert">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-500">Loading…</div>
        ) : reasons.length === 0 ? (
          <div className="p-8 text-center text-ink-500">No cancellation reasons yet. Click "Add reason" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="grid">
              <thead>
                <tr className="border-b border-line bg-muted/30 text-left text-sm font-medium text-ink-500">
                  <th className="px-4 py-3 w-32 whitespace-nowrap">Code</th>
                  <th className="px-4 py-3 w-48 whitespace-nowrap">Label</th>
                  <th className="px-4 py-3 whitespace-nowrap">Description</th>
                  <th className="px-4 py-3 text-right tnum w-24 whitespace-nowrap">Order</th>
                  <th className="px-4 py-3 w-28 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-right w-36 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reasons.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-sm whitespace-nowrap">{r.code}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.label}</td>
                    <td className="px-4 py-3 text-sm text-ink-500 whitespace-nowrap">
                      {r.description ?? <span className="text-ink-500/50 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right tnum text-sm whitespace-nowrap">{r.sort_order}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        r.is_active
                          ? "bg-ok-bg text-ok-fg"
                          : "bg-muted text-ink-500"
                      }`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => startEdit(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-bad-fg hover:bg-bad-bg"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <Modal
          title={editingId === 0 ? "Add Cancellation Reason" : "Edit Cancellation Reason"}
          body={editingId === 0 ? "Create a new reason for drivers to select when cancelling rides." : "Update the reason details below."}
          confirmLabel={editingId === 0 ? "Create" : "Save"}
          cancelLabel="Cancel"
          onConfirm={handleSave}
          onClose={cancelEdit}
          confirming={saving}
        >
          <div className="space-y-4">
            <Input
              label="Code"
              name="code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="font-mono"
              required
              placeholder="e.g., no_show"
            />
            <Input
              label="Label"
              name="label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              required
              placeholder="e.g., Passenger no-show"
            />
            <Input
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sort order"
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                min={0}
                max={255}
              />
              <Select
                label="Status"
                value={form.is_active ? "true" : "false"}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "true" }))}
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}