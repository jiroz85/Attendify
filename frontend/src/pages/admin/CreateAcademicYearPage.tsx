import { useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import { createAcademicYear } from "../../services/admin";

export function CreateAcademicYearPage() {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setSaving(true);
    try {
      const res = await createAcademicYear({
        name,
        sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
        isActive,
      });
      setSuccess(`Created academic year #${res.id}`);
      setName("");
      setSortOrder("");
      setIsActive(true);
    } catch {
      setError("Failed to create academic year");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Academic Year
      </h2>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error ? <Toast type="error" message={error} /> : null}
          {success ? <Toast type="success" message={success} /> : null}

          <FormField
            label="Name"
            value={name}
            onChange={setName}
            placeholder="2024-2025"
            disabled={saving}
          />

          <FormField
            label="Sort Order (optional)"
            value={sortOrder}
            onChange={setSortOrder}
            placeholder="1"
            disabled={saving}
          />

          <label className="flex items-center gap-2 text-sm text-[var(--text-h)]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={saving}
            />
            Active
          </label>

          <button
            type="submit"
            disabled={saving || name.trim().length < 2}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </form>
      </Card>
    </div>
  );
}
