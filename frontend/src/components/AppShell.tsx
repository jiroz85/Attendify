import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export function AppShell() {
  const { user, role, logout } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--text)] md:flex">
      <aside className="w-full border-b border-[var(--border)] p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 md:block">
          <Link to="/" className="no-underline text-[var(--text-h)]">
            <div className="text-lg font-semibold">Attendfy</div>
            <div className="text-xs opacity-80">Smart Attendance Tracking</div>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm font-medium text-[var(--text-h)] md:hidden"
          >
            Logout
          </button>
        </div>

        <div className="mt-3 text-sm md:mt-6">
          <div className="font-medium text-[var(--text-h)]">{user?.email}</div>
          <div className="opacity-80">{role}</div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2 md:mt-6 md:flex-col md:gap-1.5">
          {role === "ADMIN" ? (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Dashboard
              </NavLink>

              {/* Setup Menu */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleMenu("setup")}
                  className="w-full rounded-xl border px-3 py-2 text-sm text-left transition border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Setup</span>
                  <span className="text-xs opacity-60">
                    {expandedMenu === "setup" ? "▼" : "▶"}
                  </span>
                </button>
                {expandedMenu === "setup" && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    <NavLink
                      to="/admin/departments"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Department
                    </NavLink>
                    <NavLink
                      to="/admin/academic-years"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Academic Year
                    </NavLink>
                    <NavLink
                      to="/admin/sections"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Section
                    </NavLink>
                    <NavLink
                      to="/admin/classes"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Class
                    </NavLink>
                    <NavLink
                      to="/admin/courses"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Course
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Assignments Menu */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleMenu("assignments")}
                  className="w-full rounded-xl border px-3 py-2 text-sm text-left transition border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Assignments</span>
                  <span className="text-xs opacity-60">
                    {expandedMenu === "assignments" ? "▼" : "▶"}
                  </span>
                </button>
                {expandedMenu === "assignments" && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    <NavLink
                      to="/admin/class-courses"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Class Courses
                    </NavLink>
                    <NavLink
                      to="/admin/teacher-assignments"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Teacher Assignments
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Users Menu */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleMenu("users")}
                  className="w-full rounded-xl border px-3 py-2 text-sm text-left transition border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Users</span>
                  <span className="text-xs opacity-60">
                    {expandedMenu === "users" ? "▼" : "▶"}
                  </span>
                </button>
                {expandedMenu === "users" && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    <NavLink
                      to="/admin/teachers"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Create Teacher
                    </NavLink>
                    <NavLink
                      to="/admin/manage-teachers"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Manage Teachers
                    </NavLink>
                    <NavLink
                      to="/admin/students"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Create Student
                    </NavLink>
                    <NavLink
                      to="/admin/manage-students"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Manage Students
                    </NavLink>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {role === "TEACHER" ? (
            <>
              <NavLink
                to="/teacher"
                end
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/teacher/profile"
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Profile
              </NavLink>
              <NavLink
                to="/teacher/classes"
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Assigned Classes
              </NavLink>
              <NavLink
                to="/teacher/students"
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Students
              </NavLink>
              <div>
                <button
                  type="button"
                  onClick={() => toggleMenu("attendance")}
                  className="w-full rounded-xl border px-3 py-2 text-sm text-left transition border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Attendance</span>
                  <span className="text-xs opacity-60">
                    {expandedMenu === "attendance" ? "▼" : "▶"}
                  </span>
                </button>
                {expandedMenu === "attendance" && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    <NavLink
                      to="/teacher/attendance"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Mark Attendance
                    </NavLink>
                    <NavLink
                      to="/teacher/attendance/history"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      History
                    </NavLink>
                    <NavLink
                      to="/teacher/attendance/reports"
                      className={({ isActive }) =>
                        `rounded-lg border px-3 py-1.5 text-xs no-underline transition ${
                          isActive
                            ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                            : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                        }`
                      }
                    >
                      Reports
                    </NavLink>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {role === "STUDENT" ? (
            <>
              <NavLink
                to="/student"
                end
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/student/profile"
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Profile
              </NavLink>
              <NavLink
                to="/student/attendance"
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Attendance History
              </NavLink>
              <NavLink
                to="/student/percentage"
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-2 text-sm no-underline transition ${
                    isActive
                      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                      : "border-transparent text-[var(--text)] hover:border-[var(--border)] hover:bg-white/5"
                  }`
                }
              >
                Attendance %
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="mt-6 hidden md:block">
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm font-medium text-[var(--text-h)] hover:bg-white/5"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
