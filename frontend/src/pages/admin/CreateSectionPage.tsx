import { useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import { createSection } from "../../services/admin";

export function CreateSectionPage() {
  const [name, setName] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setSaving(true);
    try {
      const res = await createSection({ name });
      setSuccess(`Created section #${res.id}`);
      setName("");
    } catch {
      setError("Failed to create section");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Section
      </h2>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error ? <Toast type="error" message={error} /> : null}
          {success ? <Toast type="success" message={success} /> : null}

          <FormField
            label="Name"
            value={name}
            onChange={setName}
            placeholder="A"
            disabled={saving}
          />

          <button
            type="submit"
            disabled={saving || name.trim().length < 1}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </form>
      </Card>
    </div>
  );
}
