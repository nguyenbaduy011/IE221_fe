import { Metadata } from "next";
import AdminDailyReportShowClient from "./AdminDailyReportShowClient";

export const metadata: Metadata = {
  title: "Trainee Report Details",
  description: "View detailed daily report from trainee",
};

export default async function AdminDailyReportShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDailyReportShowClient id={id} />;
}
