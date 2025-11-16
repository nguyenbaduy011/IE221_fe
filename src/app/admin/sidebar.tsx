"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Book, Inbox, Database } from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { href: "/supervisor/users", label: "Trainees", icon: <Users /> },
    { href: "/admin/users", label: "Supervisors", icon: <Users /> },
    { href: "/admin/admin-users", label: "Admins", icon: <Users /> },
    { href: "/supervisor/courses", label: "Courses", icon: <Book /> },
    { href: "/admin/daily-reports", label: "Reports", icon: <Inbox /> },
    { href: "/supervisor/subjects", label: "Master Data", icon: <Database /> },
  ];

  return (
    <aside
      className={`w-64 bg-gray-900 text-white p-4 h-[calc(100vh-50px)] ${
        className || ""
      }`}
    >
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
