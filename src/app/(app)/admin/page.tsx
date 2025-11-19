export default function AdminHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, Admin!</h1>
      <p className="mb-6 text-gray-700">
        Use the sidebar to manage supervisors, trainees, admins, courses,
        reports, and master data.
      </p>

      <div className="flex gap-4 flex-wrap">
        <a
          href="/admin/users"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Manage Supervisors
        </a>
        <a
          href="/admin/admin-users"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Manage Admins
        </a>
        <a
          href="/supervisor/courses"
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          Manage Courses
        </a>
        <a
          href="/admin/daily-reports"
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          View Reports
        </a>
      </div>
    </div>
  );
}
