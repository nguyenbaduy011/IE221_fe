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
      <div className="pt-16 flex">
        <TraineeSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
