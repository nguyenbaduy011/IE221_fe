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
    { name: "Subjects", href: "/supervisor/master-data/subjects" },
    { name: "Tasks", href: "/supervisor/master-data/tasks" },
    { name: "Categories", href: "/supervisor/master-data/categories" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Phần Header cố định (Tiêu đề + Tabs) */}
      <div className="flex-none bg-white border-b border-gray-200 px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Master Data Management</h1>
        
        {/* Thanh Tabs */}
        <div className="flex space-x-6">
          {tabs.map((tab) => {
            // Kiểm tra active: nếu đường dẫn hiện tại bắt đầu bằng href của tab
            const isActive = pathname.startsWith(tab.href);
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-black text-black" // Active style
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" // Inactive style
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Phần Nội dung (Thay đổi theo tab) - Có scroll riêng nếu nội dung dài */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        {children}
      </div>
    </div>
  );
}