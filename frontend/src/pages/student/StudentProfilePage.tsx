import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import { getStudentProfile, getStudentClassInfo } from "../../services/student";
import type { StudentProfile, StudentClassInfo } from "../../services/student";

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [classes, setClasses] = useState<StudentClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        setError(null);

        const [userProfile, userClasses] = await Promise.all([
          getStudentProfile(),
          getStudentClassInfo()
        ]);

        setProfile(userProfile);
        setClasses(userClasses);
      } catch (err) {
        setError("Failed to load profile data");
        console.error("Error fetching student profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4">
        <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
          Student Profile
        </h2>
        <Card>
          <div>Loading profile...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Student Profile
      </h2>

      {error && <Toast type="error" message={error} />}

      {profile && (
        <Card title="Personal Information">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm opacity-80">Full Name</div>
              <div className="font-semibold">
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.firstName || profile.lastName || "Not set"
                }
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">Email</div>
              <div className="font-semibold">{profile.email}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">Student Number</div>
              <div className="font-semibold">
                {profile.studentNumber || "Not assigned"}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">Class</div>
              <div className="font-semibold">
                {profile.className || "Not assigned"}
              </div>
            </div>
            {profile.departmentName && (
              <div>
                <div className="text-sm opacity-80">Department</div>
                <div className="font-semibold">{profile.departmentName}</div>
              </div>
            )}
            {profile.academicYearName && (
              <div>
                <div className="text-sm opacity-80">Academic Year</div>
                <div className="font-semibold">{profile.academicYearName}</div>
              </div>
            )}
            {profile.sectionName && (
              <div>
                <div className="text-sm opacity-80">Section</div>
                <div className="font-semibold">{profile.sectionName}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {classes.length > 0 && (
        <Card title="Class Information">
          <div className="space-y-4">
            {classes.map((classInfo) => (
              <div key={classInfo.id} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-[var(--text-h)] mb-2">
                  {classInfo.className}
                </h4>
                <div className="text-sm opacity-80 mb-3">
                  {classInfo.departmentName} • {classInfo.academicYearName} • {classInfo.sectionName}
                </div>
                {classInfo.courses.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Enrolled Courses:</div>
                    <div className="grid gap-2">
                      {classInfo.courses.map((course) => (
                        <div key={course.id} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{course.code} - {course.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!profile && !loading && !error && (
        <Card>
          <div className="text-sm opacity-80">No profile data available.</div>
        </Card>
      )}
    </div>
  );
}
