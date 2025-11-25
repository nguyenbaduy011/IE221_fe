"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const shouldShow = !!user;

  return (
    <div>
      {shouldShow && <Header />}

      <div className="flex">
        {shouldShow && <Sidebar className="fixed top-13 left-0" />}
        <main className={`${shouldShow ? "ml-64 pt-13" : ""} flex-1 p-6`}>
          {children}
        </main>
      </div>
    </div>
  );
}
