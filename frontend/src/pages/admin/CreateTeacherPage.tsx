import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import { createTeacher, getDepartments } from "../../services/admin";
import type { Department } from "../../services/admin";

export function CreateTeacherPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoadingDeps(true);
      try {
        const rows = await getDepartments();
        if (!cancelled) setDepartments(rows);
      } catch {
        if (!cancelled) setError("Failed to load departments");
      } finally {
        if (!cancelled) setLoadingDeps(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setSaving(true);
    try {
      const res = await createTeacher({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        employeeNumber,
        departmentId: departmentId ? Number(departmentId) : undefined,
      });
      setSuccess(`Created teacher #${res.id}`);
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmployeeNumber("");
      setDepartmentId("");
    } catch {
      setError("Failed to create teacher");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Teacher
      </h2>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error ? <Toast type="error" message={error} /> : null}
          {success ? <Toast type="success" message={success} /> : null}

          <FormField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="teacher@example.com"
            disabled={saving}
          />
          <FormField
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 6 characters"
            disabled={saving}
          />
          <FormField
            label="First Name"
            value={firstName}
            onChange={setFirstName}
            placeholder="John"
            disabled={saving}
          />
          <FormField
            label="Last Name"
            value={lastName}
            onChange={setLastName}
            placeholder="Smith"
            disabled={saving}
          />
          <FormField
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+123456789"
            disabled={saving}
          />
          <FormField
            label="Employee Number"
            value={employeeNumber}
            onChange={setEmployeeNumber}
            placeholder="T001"
            disabled={saving}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              Department (optional)
            </span>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={saving || loadingDeps}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name} (#{d.id})
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={
              saving ||
              !email.includes("@") ||
              password.length < 6 ||
              employeeNumber.trim().length < 1
            }
            className="mt-1 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </form>
      </Card>
    </div>
  );
}
