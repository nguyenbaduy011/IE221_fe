"use client";

import Link from "next/link";
import { BookOpen, History, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";

export default function TraineeSidebar() {
  const pathname = usePathname();

  const items = [
    { href: "/trainee/courses", label: "My Courses", icon: <BookOpen /> },
    { href: "/trainee/reports", label: "Report History", icon: <History /> },
    { href: "/trainee/reports/new", label: "Daily Report", icon: <Calendar /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 min-h-screen">
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
