import Header from "@/app/components/Header";
import TraineeSidebar from "./sidebar";

export default async function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />

      <div className="pt-10 flex">
        <TraineeSidebar className="fixed top-13 left-0" />

        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
