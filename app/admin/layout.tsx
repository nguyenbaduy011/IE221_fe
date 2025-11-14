import Header from "@/app/components/Header";
import AdminSidebar from "./sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />

      <div className="pt-10 flex">
        <AdminSidebar className="fixed top-13 left-0" />

        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
