import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import { createStudent, getClasses } from "../../services/admin";
import type { Class } from "../../services/admin";

export function CreateStudentPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [classId, setClassId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoadingClasses(true);
      try {
        const rows = await getClasses();
        if (!cancelled) setClasses(rows);
      } catch {
        if (!cancelled) setError("Failed to load classes");
      } finally {
        if (!cancelled) setLoadingClasses(false);
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

    const cid = Number(classId);
    if (!Number.isFinite(cid) || cid < 1) {
      setError("Select a class");
      return;
    }

    setSaving(true);
    try {
      const res = await createStudent({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        studentNumber,
        classId: cid,
      });
      setSuccess(`Created student #${res.id}`);
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setStudentNumber("");
      setClassId("");
    } catch {
      setError("Failed to create student");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Student
      </h2>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error ? <Toast type="error" message={error} /> : null}
          {success ? <Toast type="success" message={success} /> : null}

          <FormField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="student@example.com"
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
            placeholder="Alice"
            disabled={saving}
          />
          <FormField
            label="Last Name"
            value={lastName}
            onChange={setLastName}
            placeholder="Johnson"
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
            label="Student Number"
            value={studentNumber}
            onChange={setStudentNumber}
            placeholder="STU001"
            disabled={saving}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">Class</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={saving || loadingClasses}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
            >
              <option value="">Select...</option>
              {classes.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.department} / {c.academic_year} / {c.section} (#{c.id})
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
              studentNumber.trim().length < 1 ||
              !classId
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
