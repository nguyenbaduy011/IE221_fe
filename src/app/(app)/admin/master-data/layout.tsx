"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MasterDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Subjects", href: "/admin/master-data/subjects" },
    { name: "Tasks", href: "/admin/master-data/tasks" },
    { name: "Categories", href: "/admin/master-data/categories" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Phần Header cố định */}
      <div className="flex-none bg-background border-b border-border px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          Master Data Management
        </h1>

        {/* Thanh Tabs */}
        <div className="flex space-x-6">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Phần Nội dung */}
      <div className="flex-1 overflow-auto p-6 bg-muted/10">{children}</div>
    </div>
  );
}
