import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>
        <main>{children}</main>
      </div>
    </div>
  );
}
