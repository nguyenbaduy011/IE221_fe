import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Book,
  Inbox,
  Database,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4 min-h-screen">
      <ul className="space-y-3">
        <li>
          <Link href="/admin" className="flex gap-3 items-center">
            <LayoutDashboard /> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/supervisor/users" className="flex gap-3 items-center">
            <User /> Trainees
          </Link>
        </li>
        <li>
          <Link href="/admin/users" className="flex gap-3 items-center">
            <User /> Supervisors
          </Link>
        </li>
        <li>
          <Link href="/admin/admin-users" className="flex gap-3 items-center">
            <User /> Admins
          </Link>
        </li>
        <li>
          <Link href="/supervisor/courses" className="flex gap-3 items-center">
            <Book /> Courses
          </Link>
        </li>
        <li>
          <Link href="/admin/daily-reports" className="flex gap-3 items-center">
            <Inbox /> Reports
          </Link>
        </li>
        <li>
          <Link href="/supervisor/subjects" className="flex gap-3 items-center">
            <Database /> Master Data
          </Link>
        </li>
      </ul>
    </aside>
  );
}
