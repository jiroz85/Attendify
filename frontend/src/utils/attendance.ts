import type { AttendanceStatus } from "../services/attendance";

export function getAttendanceStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "text-green-600 bg-green-100";
    case "ABSENT":
      return "text-red-600 bg-red-100";
    case "LATE":
      return "text-yellow-600 bg-yellow-100";
    case "EXCUSED":
      return "text-blue-600 bg-blue-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getAttendanceStatusBadgeColor(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "bg-green-100 text-green-800";
    case "ABSENT":
      return "bg-red-100 text-red-800";
    case "LATE":
      return "bg-yellow-100 text-yellow-800";
    case "EXCUSED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getAttendancePerformanceColor(percentage: number): string {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 75) return "text-yellow-600";
  return "text-red-600";
}

export function getAttendancePerformanceBgColor(percentage: number): string {
  if (percentage >= 90) return "bg-green-600";
  if (percentage >= 75) return "bg-yellow-600";
  return "bg-red-600";
}

export function getAttendancePerformanceMessage(percentage: number): string {
  if (percentage >= 90) return "Excellent attendance!";
  if (percentage >= 75) return "Good attendance";
  return "Needs improvement";
}

export function formatAttendanceDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
