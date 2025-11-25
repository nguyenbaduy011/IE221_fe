"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Database, BookOpen, CheckSquare, Tag } from "lucide-react";

export default function MasterDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Subjects",
      href: "/admin/master-data/subjects",
      icon: BookOpen,
    },
    {
      name: "Tasks",
      href: "/admin/master-data/tasks",
      icon: CheckSquare,
    },
    {
      name: "Categories",
      href: "/admin/master-data/categories",
      icon: Tag,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-10 space-y-8">
      {/* HEADER SECTION */}
      <div className="space-y-6 border-b border-border pb-1">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Master Data Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Centralized control for system-wide configuration, subjects, and
            categorizations.
          </p>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </div>
  );
}
