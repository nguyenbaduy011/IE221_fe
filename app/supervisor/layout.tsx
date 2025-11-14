"use client";

import Header from "@/app/components/Header";
import SupervisorSidebar from "./sidebar";

export default  function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <div className="min-h-screen flex flex-col">

      <Header />

      <div className="flex flex-1 pt-16">

        <SupervisorSidebar />

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
