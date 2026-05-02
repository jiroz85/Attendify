import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import {
  getStudents,
  getClasses,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  deactivateStudent,
  activateStudent,
} from "../../services/admin";
import type { Student, Class } from "../../services/admin";

export function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [resettingPassword, setResettingPassword] = useState<number | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [classId, setClassId] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, classesData] = await Promise.all([
          getStudents(),
          getClasses(),
        ]);
        setStudents(studentsData);
        setClasses(classesData);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function startEdit(student: Student) {
    setEditingStudent(student);
    setEmail(student.email);
    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setPhone(student.phone || "");
    setStudentNumber(student.student_number || "");
    setClassId(student.class_id ? String(student.class_id) : "");
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingStudent(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setStudentNumber("");
    setClassId("");
    setError(null);
    setSuccess(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateStudent({
        id: editingStudent.id,
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        studentNumber,
        classId: classId ? Number(classId) : undefined,
      });

      // Update local state
      setStudents(
        students.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                email,
                first_name: firstName,
                last_name: lastName,
                phone,
                student_number: studentNumber,
                class_id: classId ? Number(classId) : null,
              }
            : s,
        ),
      );

      setSuccess("Student updated successfully");
      cancelEdit();
    } catch {
      setError("Failed to update student");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this student? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteStudent(id);
      setStudents(students.filter((s) => s.id !== id));
      setSuccess("Student deleted successfully");
    } catch {
      setError("Failed to delete student");
    }
  }

  async function handleDeactivate(id: number) {
    if (
      !confirm(
        "Are you sure you want to deactivate this student? They won't be able to log in.",
      )
    ) {
      return;
    }

    try {
      await deactivateStudent(id);
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, status_code: "SUSPENDED" } : s,
        ),
      );
      setSuccess("Student deactivated successfully");
    } catch {
      setError("Failed to deactivate student");
    }
  }

  async function handleActivate(id: number) {
    try {
      await activateStudent(id);
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, status_code: "ACTIVE" } : s,
        ),
      );
      setSuccess("Student activated successfully");
    } catch {
      setError("Failed to activate student");
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (resettingPassword === null) return;

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await resetStudentPassword({
        id: resettingPassword,
        password: newPassword,
      });
      setSuccess("Password reset successfully");
      setResettingPassword(null);
      setNewPassword("");
    } catch {
      setError("Failed to reset password");
    } finally {
      setSaving(false);
    }
  }

  function getClassName(classId: number | null): string {
    if (!classId) return "None";
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return "Unknown";
    return `${cls.department} / ${cls.academic_year} / ${cls.section}`;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Manage Students
      </h2>

      {error ? <Toast type="error" message={error} /> : null}
      {success ? <Toast type="success" message={success} /> : null}

      {editingStudent && (
        <Card title="Edit Student">
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="student@example.com"
                disabled={saving}
              />
              <FormField
                label="Student Number"
                value={studentNumber}
                onChange={setStudentNumber}
                placeholder="STU001"
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
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--text-h)]">
                  Class
                </span>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
                >
                  <option value="">None</option>
                  {classes.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.department} / {c.academic_year} / {c.section}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={
                  saving || !email.includes("@") || !studentNumber.trim()
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-4 font-semibold text-[var(--text-h)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {resettingPassword !== null && (
        <Card title="Reset Password">
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-3">
            <FormField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimum 6 characters"
              type="password"
              disabled={saving}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !newPassword || newPassword.length < 6}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResettingPassword(null);
                  setNewPassword("");
                }}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-4 font-semibold text-[var(--text-h)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Student #</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Class</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-[var(--border)]"
                >
                  <td className="p-2">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="p-2">{student.email}</td>
                  <td className="p-2">{student.student_number}</td>
                  <td className="p-2">{student.phone || "-"}</td>
                  <td className="p-2">{getClassName(student.class_id)}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        student.status_code === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.status_code}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => startEdit(student)}
                        className="px-2 py-1 text-xs rounded border border-[var(--border)] hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setResettingPassword(student.id)}
                        className="px-2 py-1 text-xs rounded border border-[var(--border)] hover:bg-white/5"
                      >
                        Reset PW
                      </button>
                      {student.status_code === "ACTIVE" ? (
                        <button
                          onClick={() => handleDeactivate(student.id)}
                          className="px-2 py-1 text-xs rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(student.id)}
                          className="px-2 py-1 text-xs rounded border border-green-500 text-green-500 hover:bg-green-500/10"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="px-2 py-1 text-xs rounded border border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-8 opacity-60">No students found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
