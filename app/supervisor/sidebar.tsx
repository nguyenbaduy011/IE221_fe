"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Book, Inbox, Database } from "lucide-react";
import { usePathname } from "next/navigation";

export default function SupervisorSidebar() {
  const pathname = usePathname();

  const items = [
    {
      href: "/supervisor/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard />,
    },
    { href: "/supervisor/users", label: "Trainees", icon: <Users /> },
    { href: "/supervisor/courses", label: "Courses", icon: <Book /> },
    { href: "/supervisor/daily-reports", label: "Reports", icon: <Inbox /> },
    { href: "/supervisor/subjects", label: "Master Data", icon: <Database /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 min-h-[calc(100vh-64px)] overflow-auto">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex gap-3 items-center p-2 rounded ${
                pathname === item.href ? "bg-gray-700" : ""
              }`}
            >
              {item.icon} {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
