"use client";

import Header from "@//components/Header";
import SupervisorSidebar from "./sidebar";
import { Toaster } from "@//components/ui/sonner";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />

      <div className="pt-10 flex">
        <SupervisorSidebar className="fixed top-13 left-0" />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
