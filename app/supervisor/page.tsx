export default function SupervisorHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, Supervisor!</h1>
      <p className="mb-6 text-gray-700">
        Use the sidebar to manage trainees, courses, daily reports, and master
        data.
      </p>

      <div className="flex gap-4 flex-wrap">
        <a
          href="/supervisor/users"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Manage Trainees
        </a>
        <a
          href="/supervisor/courses"
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          Manage Courses
        </a>
        <a
          href="/supervisor/daily-reports"
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          View Reports
        </a>
      </div>
    </div>
  );
}
