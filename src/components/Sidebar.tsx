"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Book,
  Inbox,
  Database,
  BookOpen,
  History,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  type MenuItem = { href: string; label: string; icon: React.ReactNode };
  let items: MenuItem[] = [];

  switch (user.role) {
    case "ADMIN":
      items = [
        {
          href: "/admin/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          href: "/admin/users",
          label: "Users",
          icon: <Users size={20} />,
        },
        {
          href: "/admin/courses",
          label: "Courses",
          icon: <Book size={20} />,
        },
        {
          href: "/admin/daily-reports",
          label: "Reports",
          icon: <Inbox size={20} />,
        },
        {
          href: "/admin/master-data",
          label: "Master Data",
          icon: <Database size={20} />,
        },
      ];
      break;
    case "SUPERVISOR":
      items = [
        {
          href: "/supervisor/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          href: "/supervisor/users",
          label: "Trainees",
          icon: <Users size={20} />,
        },
        {
          href: "/supervisor/courses",
          label: "Courses",
          icon: <Book size={20} />,
        },
        {
          href: "/supervisor/daily-reports",
          label: "Reports",
          icon: <Inbox size={20} />,
        },
        {
          href: "/supervisor/master-data",
          label: "Master Data",
          icon: <Database size={20} />,
        },
      ];
      break;
    case "TRAINEE":
      items = [
        {
          href: "/trainee/courses",
          label: "My Courses",
          icon: <BookOpen size={20} />,
        },
        {
          href: "/trainee/daily-reports",
          label: "Report History",
          icon: <History size={20} />,
        },
        {
          href: "/trainee/daily-reports/new",
          label: "Daily Report",
          icon: <Calendar size={20} />,
        },
      ];
      break;
    default:
      return null;
  }

  return (
    <aside
      className={`w-64 bg-card border-r text-card-foreground p-4 h-[calc(100vh-64px)] fixed  left-0 top-0 ${
        className || ""
      }`}
    >
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex gap-3 items-center p-3 rounded-lg transition ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
