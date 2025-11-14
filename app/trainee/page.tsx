export default function TraineeHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, Trainee!</h1>
      <p className="mb-6 text-gray-700">
        Use the sidebar to access your courses, daily reports, and report
        history.
      </p>

      <div className="flex gap-4">
        <a
          href="/trainee/reports/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create Daily Report
        </a>
        <a
          href="/trainee/reports"
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          View Report History
        </a>
      </div>
    </div>
  );
}
