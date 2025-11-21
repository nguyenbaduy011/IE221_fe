import { Metadata } from "next";
import SupervisorDailyReportShowClient from "./SupervisorDailyReportShowClient";

export const metadata: Metadata = {
  title: "Trainee Report Details",
  description: "View detailed daily report from trainee",
};

export default async function SupervisorDailyReportShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupervisorDailyReportShowClient id={id} />;
}
