import { useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import { createDepartment } from "../../services/admin";

export function CreateDepartmentPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await createDepartment({ name });
      setSuccess(`Created department #${res.id}`);
      setName("");
    } catch {
      setError("Failed to create department");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Department
      </h2>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error ? <Toast type="error" message={error} /> : null}
          {success ? <Toast type="success" message={success} /> : null}
          <FormField
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Computer Science"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || name.trim().length < 2}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </Card>
    </div>
  );
}
