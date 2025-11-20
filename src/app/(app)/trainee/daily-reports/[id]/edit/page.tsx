import { Metadata } from "next";
import EditDailyReportClient from "./EditDailyReportClient";

export const metadata: Metadata = {
  title: "Edit Daily Report",
  description: "Update your daily learning progress",
};

export default async function EditDailyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditDailyReportClient id={id} />;
}
