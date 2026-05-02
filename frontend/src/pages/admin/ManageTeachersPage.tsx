import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import {
  getTeachers,
  getDepartments,
  updateTeacher,
  deleteTeacher,
  resetTeacherPassword,
  deactivateTeacher,
  activateTeacher,
} from "../../services/admin";
import type { Teacher, Department } from "../../services/admin";

export function ManageTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
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
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [teachersData, departmentsData] = await Promise.all([
          getTeachers(),
          getDepartments(),
        ]);
        setTeachers(teachersData);
        setDepartments(departmentsData);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function startEdit(teacher: Teacher) {
    setEditingTeacher(teacher);
    setEmail(teacher.email);
    setFirstName(teacher.first_name || "");
    setLastName(teacher.last_name || "");
    setPhone(teacher.phone || "");
    setEmployeeNumber(teacher.employee_number || "");
    setDepartmentId(teacher.department_id ? String(teacher.department_id) : "");
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingTeacher(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmployeeNumber("");
    setDepartmentId("");
    setError(null);
    setSuccess(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTeacher) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateTeacher({
        id: editingTeacher.id,
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        employeeNumber,
        departmentId: departmentId ? Number(departmentId) : undefined,
      });

      // Update local state
      setTeachers(
        teachers.map((t) =>
          t.id === editingTeacher.id
            ? {
                ...t,
                email,
                first_name: firstName,
                last_name: lastName,
                phone,
                employee_number: employeeNumber,
                department_id: departmentId ? Number(departmentId) : null,
              }
            : t,
        ),
      );

      setSuccess("Teacher updated successfully");
      cancelEdit();
    } catch {
      setError("Failed to update teacher");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this teacher? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteTeacher(id);
      setTeachers(teachers.filter((t) => t.id !== id));
      setSuccess("Teacher deleted successfully");
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError(
          error.response.data?.message ||
            "Cannot delete teacher: they have attendance records",
        );
      } else {
        setError("Failed to delete teacher");
      }
    }
  }

  async function handleDeactivate(id: number) {
    if (
      !confirm(
        "Are you sure you want to deactivate this teacher? They won't be able to log in.",
      )
    ) {
      return;
    }

    try {
      await deactivateTeacher(id);
      setTeachers(
        teachers.map((t) =>
          t.id === id ? { ...t, status_code: "SUSPENDED" } : t,
        ),
      );
      setSuccess("Teacher deactivated successfully");
    } catch {
      setError("Failed to deactivate teacher");
    }
  }

  async function handleActivate(id: number) {
    try {
      await activateTeacher(id);
      setTeachers(
        teachers.map((t) =>
          t.id === id ? { ...t, status_code: "ACTIVE" } : t,
        ),
      );
      setSuccess("Teacher activated successfully");
    } catch {
      setError("Failed to activate teacher");
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
      await resetTeacherPassword({
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Manage Teachers
      </h2>

      {error ? <Toast type="error" message={error} /> : null}
      {success ? <Toast type="success" message={success} /> : null}

      {editingTeacher && (
        <Card title="Edit Teacher">
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="teacher@example.com"
                disabled={saving}
              />
              <FormField
                label="Employee Number"
                value={employeeNumber}
                onChange={setEmployeeNumber}
                placeholder="T001"
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
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--text-h)]">
                  Department (optional)
                </span>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
                >
                  <option value="">None</option>
                  {departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={
                  saving || !email.includes("@") || !employeeNumber.trim()
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
                <th className="text-left p-2">Employee #</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Department</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b border-[var(--border)]"
                >
                  <td className="p-2">
                    {teacher.first_name} {teacher.last_name}
                  </td>
                  <td className="p-2">{teacher.email}</td>
                  <td className="p-2">{teacher.employee_number}</td>
                  <td className="p-2">{teacher.phone || "-"}</td>
                  <td className="p-2">
                    {teacher.department_id
                      ? departments.find((d) => d.id === teacher.department_id)
                          ?.name || "Unknown"
                      : "None"}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        teacher.status_code === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {teacher.status_code}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => startEdit(teacher)}
                        className="px-2 py-1 text-xs rounded border border-[var(--border)] hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setResettingPassword(teacher.id)}
                        className="px-2 py-1 text-xs rounded border border-[var(--border)] hover:bg-white/5"
                      >
                        Reset PW
                      </button>
                      {teacher.status_code === "ACTIVE" ? (
                        <button
                          onClick={() => handleDeactivate(teacher.id)}
                          className="px-2 py-1 text-xs rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(teacher.id)}
                          className="px-2 py-1 text-xs rounded border border-green-500 text-green-500 hover:bg-green-500/10"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(teacher.id)}
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
          {teachers.length === 0 && (
            <div className="text-center py-8 opacity-60">No teachers found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
