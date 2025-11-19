import { Metadata } from "next";
import DailyReportShowClient from "./DailyReportShowClient";

export const metadata: Metadata = {
  title: "Daily Report Details",
  description: "View details of your daily report",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DailyReportShowClient id={id} />;
}
